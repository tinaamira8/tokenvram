import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { FaqItem } from '@/components/site/seo';

export function FaqAccordion({ items, heading }: { items: FaqItem[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground sm:text-[26px]">
        {heading ?? 'Frequently asked questions'}
      </h2>
      <Accordion type="single" collapsible className="mt-4 border-t border-border">
        {items.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`} className="border-b border-border">
            <AccordionTrigger className="gap-4 py-4 text-left font-sans text-[14.5px] font-medium leading-[1.5] text-foreground hover:no-underline">
              <span className="flex items-start gap-3">
                <span className="mt-[3px] font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{item.q}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pl-[30px] pr-6 text-[13.5px] leading-[1.75] text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
