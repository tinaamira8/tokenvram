import type { ReactNode } from 'react';
import { AdSlot } from '@/components/site/ad-slot';
import { Seo } from '@/components/site/seo';
import { Breadcrumbs, PageHeader, SimpleLayout } from '@/components/site/layout';

const UPDATED = 'October 21, 2026';

function LegalPage({
  title,
  description,
  path,
  kicker,
  lede,
  children,
}: {
  title: string;
  description: string;
  path: string;
  kicker: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: kicker, path },
        ]}
      />
      <SimpleLayout>
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: kicker }]} />
        <PageHeader kicker={kicker} title={lede} meta={<p className="micro">Last updated {UPDATED}</p>} />
        <div className="mt-8 space-y-7">{children}</div>
        <div className="mt-10">
          <AdSlot id={`${kicker.toLowerCase().replace(/\s+/g, '-')}-inline`} format="horizontal" />
        </div>
      </SimpleLayout>
    </>
  );
}

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.02em] text-foreground">{heading}</h2>
      <div className="mt-2 space-y-2.5 text-[13.5px] leading-[1.75] text-foreground/80">{children}</div>
    </section>
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy — Modelmath"
      description="How Modelmath handles data: client-side-only calculations, Google AdSense and DoubleClick DART cookies, third-party vendor cookies, and how to opt out of personalised advertising."
      path="/privacy-policy"
      kicker="Privacy policy"
      lede="Privacy policy"
    >
      <p>
        This policy explains what information Modelmath collects, how advertising cookies are used, and how you can
        control them. Modelmath is operated as an independent developer resource. Questions can be sent to the address
        on our contact page.
      </p>

      <Block heading="1. Information we do not collect">
        <p>
          The calculators on this site run entirely in your browser. Prompt text you paste into the tokenizer, your
          workload numbers, the hardware you select, and any presets you save are never transmitted to us. Presets are
          stored in your browser's local storage and can be deleted at any time from the calculator interface or by
          clearing site data.
        </p>
        <p>
          There are no accounts or logins. The only information stored on our server is what you choose to send through
          the contact form — your name, email address, topic and message — which is kept privately and used solely to
          reply to you. You can ask for it to be deleted by writing to helloweb717@gmail.com.
        </p>
      </Block>

      <Block heading="2. Google AdSense and DoubleClick DART cookies">
        <p>
          Modelmath is supported by advertising and may display advertisements served by Google AdSense and its
          partners. Google, as a third-party vendor, uses cookies to serve ads on this site. Google's use of advertising
          cookies — including the DoubleClick DART cookie — enables it and its partners to serve ads to you based on
          your visit to this and other sites on the internet.
        </p>
        <p>
          Third-party vendors and ad networks may also place and read cookies on your browser, or use web beacons, pixel
          tags or IP addresses, in the course of serving advertisements on this site. These technologies are controlled
          by the third parties, not by Modelmath.
        </p>
      </Block>

      <Block heading="3. Opting out of personalised advertising">
        <p>
          You may opt out of personalised advertising from Google by visiting Google's Ads Settings. You can also opt out
          of participating third-party vendors' use of cookies for personalised advertising through the Digital
          Advertising Alliance's opt-out portal (aboutads.info) or the Network Advertising Initiative's opt-out page.
        </p>
        <p>
          Opting out does not remove advertising; it makes the ads you see less relevant. You can additionally configure
          your browser to block third-party cookies or to clear cookies on exit, though some site features may behave
          differently.
        </p>
      </Block>

      <Block heading="4. Server logs and analytics">
        <p>
          Our hosting provider may record standard technical logs — IP address, user agent, requested URL, timestamp and
          response status — for security, abuse prevention and capacity planning. These logs are retained for a limited
          period and are not joined to any identity we hold, because we hold none.
        </p>
        <p>
          If aggregate analytics are enabled in future, this page will be updated to name the provider and describe the
          data involved before it goes live.
        </p>
      </Block>

      <Block heading="5. Cookies we set ourselves">
        <p>
          Modelmath sets no tracking cookies of its own. Two pieces of browser storage are used purely for functionality:
          your light or dark theme preference, and any calculator presets you explicitly save. Both remain on your
          device.
        </p>
      </Block>

      <Block heading="6. Children's privacy">
        <p>
          This site is a developer tool and is not directed at children under 13. We do not knowingly collect personal
          information from children. Advertising vendors are expected to comply with applicable age-related restrictions
          in their own policies.
        </p>
      </Block>

      <Block heading="7. Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct, delete or restrict processing of personal
          data, or to object to personalised advertising. Because we do not hold personal data, most requests are best
          directed to the advertising vendors that set cookies. You may also contact us and we will help where we can.
        </p>
      </Block>

      <Block heading="8. Changes to this policy">
        <p>
          Material changes will be reflected here with an updated date. Continued use of the site after a change
          constitutes acceptance of the revised policy.
        </p>
      </Block>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service — Modelmath"
      description="Terms governing use of Modelmath's LLM API cost and VRAM calculators, including the informational-only disclaimer for cost and hardware estimates."
      path="/terms-of-service"
      kicker="Terms of service"
      lede="Terms of service"
    >
      <p>
        These terms govern your use of Modelmath. By using the site you agree to them. If you do not agree, please stop
        using the site.
      </p>

      <Block heading="1. Informational estimates only">
        <p>
          All outputs from the API cost calculator and the VRAM calculator are estimates provided for informational
          purposes. They are not quotations, financial advice, procurement advice, or a guarantee that any model will
          run on any hardware. Token pricing, context limits, quantization behaviour and achievable throughput all change
          without notice and vary by provider, runtime version, driver and workload shape.
        </p>
        <p>
          You are responsible for verifying any figure against official provider documentation and your own measurements
          before making a purchasing or architectural decision.
        </p>
      </Block>

      <Block heading="2. No warranty">
        <p>
          The site and its calculators are provided "as is" and "as available", without warranties of any kind, express
          or implied, including merchantability, fitness for a particular purpose, accuracy and non-infringement. We do
          not warrant that the site will be uninterrupted, error-free or free of harmful components.
        </p>
      </Block>

      <Block heading="3. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Modelmath and its operator are not liable for any indirect,
          incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill,
          arising from your use of the site or reliance on any estimate it produces.
        </p>
      </Block>

      <Block heading="4. Acceptable use">
        <p>
          You may use the calculators freely for personal and commercial evaluation. You may not scrape the site at a
          rate that degrades service for others, attempt to interfere with its operation, or reproduce substantial
          portions of its written content without attribution.
        </p>
      </Block>

      <Block heading="5. Third-party links and advertising">
        <p>
          The site contains links to third-party documentation and displays third-party advertising. We do not control
          and are not responsible for the content, accuracy or practices of those third parties. Your interactions with
          advertisers are solely between you and them.
        </p>
      </Block>

      <Block heading="6. Intellectual property">
        <p>
          The written guides, calculator implementations and visual design of Modelmath are the property of their
          author. Model names, provider names and trademarks referenced on the site belong to their respective owners
          and are used descriptively. Modelmath is not affiliated with, endorsed by or sponsored by any model or hardware
          vendor.
        </p>
      </Block>

      <Block heading="7. Changes">
        <p>
          We may update these terms as the product evolves. The revision date at the top of this page reflects the most
          recent change. Continued use after an update constitutes acceptance.
        </p>
      </Block>
    </LegalPage>
  );
}
