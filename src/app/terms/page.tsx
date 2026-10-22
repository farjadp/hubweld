import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: "Terms of Service",
  description: "The terms for using HubWeld: accounts, the job marketplace, the supply shop, orders, content, and liability.",
  alternates: { canonical: "/terms" },
};

/*
 * These terms describe how the product actually works today: no payment is
 * taken online, orders are confirmed by the team, HubWeld is not a party to
 * work agreed between customers and welders. Change them when that changes.
 */

const ul = "list-disc space-y-1.5 pl-5";
const a = "text-brand underline underline-offset-2";

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <p>
        These terms are an agreement between you and {LEGAL.entity} (&ldquo;HubWeld&rdquo;, &ldquo;we&rdquo;) and apply to the website at hubweld.ca and the HubWeld apps. By creating an account or using the service you accept them. Our{" "}
        <Link className={a} href="/privacy">Privacy Policy</Link> explains how we handle your information.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul className={ul}>
        <li>You must be at least 18 and able to enter into a binding contract. If you register for a business, you confirm you are authorised to act for it.</li>
        <li>Give accurate information and keep it current: your name, contact details, and, for welders, your certifications and experience.</li>
        <li>Keep your password to yourself. You are responsible for what happens under your account; tell us straight away if you think someone else has access.</li>
        <li>You can delete your account at any time, in the app or in your account settings on the website.</li>
      </ul>
    ),
  },
  {
    id: "marketplace",
    title: "The job marketplace",
    body: (
      <>
        <p>
          HubWeld connects customers who need welding work with welders who do it. <strong>We are not a party to the work.</strong> When a customer accepts a bid, the agreement to do the job, at the price bid, is between the customer and the welder. HubWeld does not employ the welders, does not perform or supervise the work, and does not guarantee its quality, timing or safety.
        </p>
        <ul className={ul}>
          <li><strong>Customers</strong> describe the job honestly, including site conditions and access, and pay the welder as agreed between them.</li>
          <li><strong>Welders</strong> hold the certifications, licences and insurance their work requires, bid only on work they are qualified for, and do the work they agreed to.</li>
          <li>A &ldquo;Verified&rdquo; badge means we reviewed the profile. It is not a guarantee of the welder&rsquo;s work, and it does not replace your own checks for safety-critical or code-regulated work.</li>
          <li>Reviews must describe a real job you were part of, honestly.</li>
        </ul>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders from the shop",
    body: (
      <>
        <p>Products in the shop are listed and shipped by independent suppliers. HubWeld runs the shop and handles the order with you.</p>
        <ul className={ul}>
          <li><strong>No payment is taken when you place an order.</strong> Placing an order is a request: it reserves the stock, and our team then contacts you to confirm the order and arrange payment, or, if you asked for Net 30 terms and your account is approved for them, to invoice you.</li>
          <li>Prices are in Canadian dollars. Prices shown in other currencies are estimates for convenience only.</li>
          <li>Sales tax shown at checkout is an estimate based on the delivery province, and is confirmed with you before payment. Shipping is CAD $15 per order, free over CAD $500, unless we tell you otherwise when we confirm.</li>
          <li>You can cancel an order yourself until it ships. After that, contact us. We or a supplier may cancel an order, for example if an item is out of stock or a price was listed in error, and will tell you if we do.</li>
          <li>Questions about a product&rsquo;s condition, a delivery, a return or a warranty start with us; we will work them out with the supplier.</li>
        </ul>
      </>
    ),
  },
  {
    id: "suppliers",
    title: "Selling as a supplier",
    body: (
      <ul className={ul}>
        <li>Your listings must be accurate: what the product is, its condition, its specifications and its price. Keep stock levels current.</li>
        <li>Ship confirmed orders promptly and mark them shipped. Cancel a line only when you genuinely cannot fill it.</li>
        <li>You are responsible for the products you sell, including their safety, compliance with the law, and any warranty you offer.</li>
      </ul>
    ),
  },
  {
    id: "content",
    title: "Your content",
    body: (
      <>
        <p>
          You keep ownership of what you post: profiles, photos, job descriptions, listings, bids, messages and reviews. You give HubWeld a non-exclusive, royalty-free licence to host, display and distribute that content on the service, and to show public content (such as profiles, jobs and listings) in search results and previews, for as long as it is on HubWeld.
        </p>
        <p>Only post content you have the right to post. Photos of a job site or a finished weld must be yours to share.</p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "What is not allowed",
    body: (
      <ul className={ul}>
        <li>False or misleading information, including fake certifications, fake reviews or listings for products you do not have.</li>
        <li>Harassment, threats or discrimination in messages or anywhere else.</li>
        <li>Using HubWeld&rsquo;s messages or bids to send spam, or to steer users onto another platform to avoid our terms.</li>
        <li>Anything illegal, including selling prohibited or stolen goods.</li>
        <li>Interfering with the service: probing for vulnerabilities, scraping it in bulk, or accessing accounts or data that are not yours.</li>
      </ul>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <p>
        We may remove content, withdraw a verification, or suspend or close an account that breaks these terms or puts other users at risk. Where it is reasonable to do so, we will tell you why. Ending your account does not cancel an order or a job already in progress, or anything you still owe under one.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and limits of liability",
    body: (
      <>
        <p>
          HubWeld is provided &ldquo;as is&rdquo;. We work to keep it accurate and available, but we do not promise it will be uninterrupted or error-free. Because we are not a party to the work between customers and welders, we are not responsible for that work, for injury or damage arising from it, or for a party failing to do what they agreed.
        </p>
        <p>
          To the extent the law allows, HubWeld is not liable for indirect or consequential losses, such as lost profits or business interruption. Our total liability to you for any claim is limited to the greater of the amount you paid HubWeld in the 12 months before the claim and CAD $100. Nothing in these terms limits liability that cannot be limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: <p>These terms are governed by the laws of {LEGAL.jurisdiction}. You and we agree to the jurisdiction of the courts located there, except where consumer protection law gives you the right to bring a claim where you live.</p>,
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        If we change these terms, we will update the date at the top of this page and, for material changes, tell you by email or in the app before they take effect. Continuing to use HubWeld after that means you accept the new terms. Questions:{" "}
        <a className={a} href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>, or by mail to {LEGAL.entity}, {LEGAL.address}.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Service"
      intro={
        <p>
          The rules for using HubWeld. The two that matter most: HubWeld connects customers and welders but is not a party to the work they agree, and no payment is taken when you order from the shop. Our team confirms each order with you first.
        </p>
      }
      sections={sections}
    />
  );
}
