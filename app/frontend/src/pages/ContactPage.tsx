import { useState } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { createClient } from '@metagptx/web-sdk';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, SimpleLayout } from '@/components/site/layout';
import { SUPPORT_EMAIL } from '@/lib/site';

// Created lazily: the SDK touches `window`, which does not exist during prerendering.
let client: ReturnType<typeof createClient> | null = null;
const getClient = () => (client ??= createClient());

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', topic: 'correction', message: '' };

const TOPICS = [
  { value: 'correction', label: 'Data correction' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'bug', label: 'Bug report' },
  { value: 'other', label: 'Something else' },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please add a name so we know who to reply to.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 12) next.message = 'Please add at least a sentence of detail.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    try {
      await getClient().apiCall.invoke({
        url: '/api/v1/contact/submit',
        method: 'POST',
        data: { ...form, website: honeypot },
      });
      setSent(true);
      setForm(EMPTY);
    } catch (e: unknown) {
      const err = e as { data?: { detail?: string }; response?: { data?: { detail?: string } }; message?: string };
      setSubmitError(
        err?.data?.detail ||
          err?.response?.data?.detail ||
          `Your message could not be sent. Please email ${SUPPORT_EMAIL} directly.`,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact Modelmath — Corrections, Advertising & Support"
        description="Report a pricing or hardware correction, ask about advertising, or send feedback about the LLM cost and VRAM calculators."
        path="/contact"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      <SimpleLayout>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
        <PageHeader
          kicker="Contact"
          title="Tell us what is wrong"
          lede="Data corrections get priority. If a price moved or a hardware configuration is modelled badly, include the model or GPU and your source, and we will fix it."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            {sent ? (
              <div className="border border-ok/40 bg-ok/5 p-5" role="status" aria-live="polite">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-ok" aria-hidden="true" />
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ok">Message sent</p>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-foreground">
                  Thanks — your message has been received. We reply from{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground underline decoration-border underline-offset-4">
                    {SUPPORT_EMAIL}
                  </a>
                  , usually within a few business days.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 inline-flex min-h-[34px] items-center border border-border px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Write another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="contact-name"
                    label="Your name"
                    value={form.name}
                    onChange={(value) => setField('name', value)}
                    error={errors.name}
                    autoComplete="name"
                  />
                  <Field
                    id="contact-email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setField('email', value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="contact-topic" className="micro">
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(event) => setField('topic', event.target.value)}
                    className="mt-2 min-h-[42px] w-full border border-input bg-card px-3 text-[13.5px] text-foreground outline-none transition-colors focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="micro">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={(event) => setField('message', event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className="mt-2 w-full resize-y border border-input bg-card p-3 text-[13.5px] leading-[1.7] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                    placeholder="Which page, which number, and what the correct value should be…"
                  />
                  {errors.message ? (
                    <p id="contact-message-error" className="mt-1.5 text-[11.5px] text-bad" role="alert">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </div>

                {submitError ? (
                  <p className="border border-bad/40 bg-bad/5 px-3 py-2 text-[12.5px] text-bad" role="alert" aria-live="polite">
                    {submitError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex min-h-[42px] items-center gap-2 bg-primary px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {sending ? 'Sending…' : 'Submit message'}
                </button>
              </form>
            )}
          </div>

          <aside className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <p className="micro">Direct email</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-1.5 block font-mono text-[12.5px] text-foreground underline decoration-border decoration-1 underline-offset-4 hover:decoration-foreground"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-4 text-[12.5px] leading-[1.65] text-muted-foreground">
              We answer data corrections within a few business days. Advertising enquiries should include the domain and
              expected placement.
            </p>
            <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-[1.6] text-muted-foreground">
              Messages are stored privately and used only to reply to you. See the privacy policy for details.
            </p>
          </aside>
        </div>

        <div className="mt-10">
          <AdSlot id="contact-inline" format="horizontal" />
        </div>
      </SimpleLayout>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="micro">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 min-h-[42px] w-full border border-input bg-card px-3 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[11.5px] text-bad" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
