"""Public contact form endpoint.

Visitors are not logged in, so this route accepts anonymous submissions and
stores them in `contact_messages` under the `anonymous` owner. It exposes no
read access: messages can only be reviewed through the backend data console.
"""
import logging
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.contact_messages import Contact_messagesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])

ALLOWED_TOPICS = {"correction", "advertising", "bug", "other"}
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


class ContactSubmitRequest(BaseModel):
    name: str = Field(..., max_length=120)
    email: str = Field(..., max_length=254)
    topic: str = Field(..., max_length=40)
    message: str = Field(..., max_length=5000)
    # Honeypot: real users never see or fill this field.
    website: str = ""


class ContactSubmitResponse(BaseModel):
    ok: bool
    id: int | None = None


@router.post("/submit", response_model=ContactSubmitResponse)
async def submit_contact(data: ContactSubmitRequest, db: AsyncSession = Depends(get_db)):
    if data.website.strip():
        # Silently accept bot submissions without storing them.
        return ContactSubmitResponse(ok=True)

    name = data.name.strip()
    email = data.email.strip()
    message = data.message.strip()
    topic = data.topic.strip().lower()

    if not name:
        raise HTTPException(status_code=422, detail="Please add a name so we know who to reply to.")
    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    if len(message) < 12:
        raise HTTPException(status_code=422, detail="Please add at least a sentence of detail.")
    if topic not in ALLOWED_TOPICS:
        topic = "other"

    try:
        service = Contact_messagesService(db)
        record = await service.create(
            {"name": name, "email": email, "topic": topic, "message": message, "status": "new"},
            user_id="anonymous",
        )
        record_id = record.id if record else None
        await db.commit()
        return ContactSubmitResponse(ok=True, id=record_id)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("Contact submission failed: %s", exc)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Could not send your message. Please email us directly.")
