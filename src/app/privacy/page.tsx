import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy",
  description: "What HubWeld collects, why, who it is shared with, how long it is kept, and how to see, correct or delete it.",
  alternates: { canonical: "/privacy" },
};

/*
 * Every statement here should be true of the code as it stands. When a data
 * flow changes — a new third-party service, analytics, a payment gateway, a
 * new field on a profile — update this page in the same change.
 */

const ul = "list-disc space-y-1.5 pl-5";
const a = "text-brand underline underline-offset-2";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          HubWeld is operated by {LEGAL.entity}, {LEGAL.address} (&ldquo;HubWeld&rdquo;, &ldquo;we&rdquo;). This policy covers the website at hubweld.ca and the HubWeld
          apps for iOS and Android, which share one account and one set of data.
        </p>
        <p>
          We handle personal information under Canada&rsquo;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA). Questions or requests go to{" "}
          <a className={a} href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p><strong>Your account.</strong> Name, email address, password (stored only as a one-way hash, never in readable form), the type of account you chose (customer, welder or supplier), and optionally your city and phone number.</p>
        <p><strong>If you are a welder.</strong> What you add to your profile: a photo, a bio, skills, certifications, hourly rate, years of experience, service area, countries served, languages, project photos and, if you upload one, a résumé.</p>
        <p><strong>If you are a supplier.</strong> Your business name, description and website, and the products you list, including their photos.</p>
        <p><strong>Jobs, bids, messages and reviews.</strong> The jobs you post (title, description, city, budget, category and any site photos), the bids you place, the messages you exchange about a job, and the reviews you write.</p>
        <p><strong>Orders.</strong> What you order and the delivery details you give at checkout: name, company, street address, city, province or state, postal code, country, phone number, notes, and whether you asked us to call you or to invoice you on Net 30 terms. <strong>We do not collect card or bank details</strong>: no payment is taken on the site or in the app.</p>
        <p><strong>From the mobile app.</strong> When you sign in, the device&rsquo;s name and platform (iOS or Android), so you can recognise your sessions; and, if you allow notifications, a push token that lets us send alerts to that device. Photos are only accessed when you choose to take or attach one; the app does not browse your photo library.</p>
        <p><strong>Technical data.</strong> Our hosting provider keeps standard server logs (IP address, time and the page or API address requested) to run and secure the service.</p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <ul className={ul}>
        <li>To run your account and sign you in, on the web and in the app.</li>
        <li>To run the marketplace: show jobs to welders, pass bids and messages between the people on a job, show welder profiles, and list suppliers&rsquo; products.</li>
        <li>To handle orders: reserve stock, send your order to the suppliers who will ship it, and contact you to confirm the order and arrange payment.</li>
        <li>To tell you about things that concern you: order emails, and in the app, alerts for new bids, accepted bids, messages, job status changes and orders.</li>
        <li>To keep the platform safe: verify welders and suppliers, investigate misuse, and enforce our <Link className={a} href="/terms">Terms</Link>.</li>
        <li>To meet legal obligations, such as keeping records of sales for tax purposes.</li>
      </ul>
    ),
  },
  {
    id: "what-is-public",
    title: "What other people can see",
    body: (
      <>
        <p>HubWeld is a marketplace, so some of what you add is meant to be seen:</p>
        <ul className={ul}>
          <li><strong>Welder profiles are public</strong>: name, profile photo, city or service area, bio, skills, certifications, rate, experience, languages, project photos and reviews. A résumé is visible only to signed-in users.</li>
          <li><strong>Posted jobs are public</strong>, including the customer&rsquo;s name, the city, the description, the budget and any site photos.</li>
          <li><strong>Bids on a job are visible to anyone who views that job</strong>: the welder&rsquo;s name, the amount and the bid message.</li>
          <li>Supplier storefront details and product listings are public.</li>
          <li><strong>Messages are private</strong> to the customer and the welder they are exchanged with. Each bidder sees only their own conversation.</li>
          <li>When you place an order, the suppliers on it receive your name and delivery details so they can ship it.</li>
        </ul>
        <p>Do not put information in a job, bid, profile or message that you would not want the people above to see.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Service providers we share it with",
    body: (
      <>
        <p>We do not sell personal information, and we do not use it for advertising. We share it only with providers who run part of the service for us, and only what they need:</p>
        <ul className={ul}>
          <li><strong>Railway</strong>: hosts the website, the app&rsquo;s server, the database and uploaded files.</li>
          <li><strong>Resend</strong>: sends our emails, such as order confirmations.</li>
          <li><strong>Expo, Apple and Google</strong>: deliver push notifications to the app. The alert text (for example, &ldquo;New bid on your job&rdquo;) passes through them.</li>
          <li><strong>Cloudflare</strong>: sits in front of the website to protect it and deliver it quickly.</li>
        </ul>
        <p>These providers may store or process information outside Canada, including in the United States, where it is subject to the laws of that country. We may also disclose information when the law requires it.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        The website sets two cookies: one that keeps you signed in, and one that remembers the currency you chose for displaying prices. We do not use analytics or advertising cookies. The app does not use cookies; it keeps your sign-in in your device&rsquo;s secure storage (Keychain on iOS, Keystore on Android).
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <p>We keep your information while your account is open. When you delete your account, we remove what identifies you (see the next section), with these exceptions:</p>
        <ul className={ul}>
          <li><strong>Order records</strong>, including the delivery details given at checkout, are kept for as long as tax law requires (in Canada, generally six years).</li>
          <li>Messages and reviews you wrote stay with the job they belong to, so the other person keeps their side of the record. They show as written by &ldquo;Deleted user&rdquo;.</li>
          <li>Jobs that were already assigned, completed or cancelled, with their photos, and bids that were accepted, declined or withdrawn, stay for the same reason, also shown as &ldquo;Deleted user&rdquo;. Your open jobs are cancelled and your pending bids are deleted. Products you listed are archived and no longer shown.</li>
        </ul>
        <p>Server logs are kept for a limited period by our hosting provider.</p>
      </>
    ),
  },
  {
    id: "delete-account",
    title: "Deleting your account",
    body: (
      <>
        <p>You can delete your account yourself at any time, and you do not need to contact us:</p>
        <ul className={ul}>
          <li><strong>In the app:</strong> Account → Delete account, then confirm with your password.</li>
          <li><strong>On the website:</strong> sign in, open <Link className={a} href="/dashboard/account#delete">Account settings</Link>, and use <em>Delete my account</em> at the bottom of the page.</li>
          <li>If you can no longer sign in, email <a className={a} href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> from the address on the account.</li>
        </ul>
        <p>
          Deletion takes effect immediately. We remove your name, email address, phone number, city and password; your welder profile, profile and project photos and résumé, or your storefront details; your cart; and every signed-in device. Your open jobs are closed, your pending bids are withdrawn and your products are taken off sale. Order records are kept as described above. Deletion cannot be undone.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          You can ask to see the personal information we hold about you, and to correct it if it is wrong. Most of it you can view and change yourself in your account and profile settings. For anything else, write to{" "}
          <a className={a} href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. We will answer within 30 days.
        </p>
        <p>
          You can turn off push notifications at any time in your phone&rsquo;s settings. If you are not satisfied with how we handle a privacy concern, you can contact the{" "}
          <a className={a} href="https://www.priv.gc.ca" rel="noopener noreferrer" target="_blank">Office of the Privacy Commissioner of Canada</a>.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Passwords are stored only as salted hashes. Traffic to the site and the app is encrypted in transit. In the app, your sign-in is kept in the device&rsquo;s secure storage, sessions expire, and signing out or deleting your account cuts off that device straight away. No system is perfectly secure; if we become aware of a breach that creates a real risk of significant harm, we will notify you and the Privacy Commissioner as the law requires.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>HubWeld is a service for trades professionals and businesses. It is not directed at children, and you must be at least 18 to create an account.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>If we change this policy, we will update the date at the top of this page. If a change materially affects how we use information you have already given us, we will tell you by email or in the app before it takes effect.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what HubWeld collects when you use the website or the app, why, who it is shared with, how long it is kept, and how to see, correct or delete it.
          In short: we collect what the marketplace needs to work, some of it (profiles, jobs, bids) is public by design, we take no payment details, we do not sell data, and you can delete your account yourself.
        </p>
      }
      sections={sections}
    />
  );
}
