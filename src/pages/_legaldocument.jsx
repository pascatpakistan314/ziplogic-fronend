import { useState } from "react";

const sections = [
  { id: "tos", label: "Terms of Service" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "ai", label: "AI Use & Output" },
  { id: "aup", label: "Acceptable Use" },
  { id: "refund", label: "No Refund Policy" },
  { id: "liability", label: "Liability" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "dpa", label: "Data Processing" },
  { id: "arbitration", label: "Arbitration" },
  { id: "dmca", label: "DMCA" },
];

const Alert = ({ type = "cyan", children }) => {
  const styles = {
    red: "bg-red-500/15 border-l-red-500",
    cyan: "bg-cyan-400/10 border-l-cyan-400",
    amber: "bg-amber-500/15 border-l-amber-500",
  };
  return (
    <div className={`p-5 my-5 border-l-4 rounded ${styles[type]}`}>
      {children}
    </div>
  );
};

const Contact = ({ children }) => (
  <div className="bg-slate-900/80 border border-slate-700/60 p-6 my-6 rounded">
    {children}
  </div>
);

const H2 = ({ children }) => (
  <h2 className="font-black text-2xl text-cyan-400 mt-12 mb-5 pb-3 border-b-2 border-slate-700/60">
    {children}
  </h2>
);

const H3 = ({ children }) => (
  <h3 className="font-black text-lg text-emerald-400 mt-7 mb-3">{children}</h3>
);

const H4 = ({ children }) => (
  <h4 className="font-bold text-sm text-fuchsia-500 mt-4 mb-2">{children}</h4>
);

const P = ({ children }) => (
  <p className="mb-4 text-slate-300/90 leading-relaxed">{children}</p>
);

const UL = ({ children }) => (
  <ul className="list-disc ml-6 my-3 text-slate-300/90 space-y-2">
    {children}
  </ul>
);

const Cyan = ({ children }) => (
  <strong className="text-cyan-400 font-bold">{children}</strong>
);

const Red = ({ children }) => (
  <strong className="text-red-400 font-bold">{children}</strong>
);

const Green = ({ children }) => (
  <strong className="text-emerald-400 font-bold">{children}</strong>
);

const Link = ({ href, children }) => (
  <a
    href={href}
    className="text-cyan-400 hover:text-emerald-400 underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

export default function ZipLogicLegal() {
  const [nav, setNav] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setNav(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Floating Nav */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setNav(!nav)}
          className="bg-slate-800 border border-slate-600 text-cyan-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-lg"
        >
          {nav ? "âœ• Close" : "â˜° Navigate"}
        </button>
        {nav && (
          <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="block w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors border-b border-slate-700/50 last:border-0"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-black text-center mb-10 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
          ZIPLOGIC AI
          <br />
          COMPLETE LEGAL DOCUMENTATION
        </h1>

        <Alert type="red">
          <Red>âš ï¸ CRITICAL:</Red>{" "}
          <span className="text-slate-300">
            By using ZipLogic AI, you agree to ALL of these legal terms. ZipLogic
            AI is operated by <Cyan>Pascat Graphics & Marketing Company</Cyan>.
            These policies protect both you and us.
          </span>
        </Alert>

        <p className="font-mono text-xs text-slate-500 tracking-widest mb-8">
          LAST UPDATED: February 6, 2026 â€¢ EFFECTIVE: February 6, 2026
        </p>

        <Contact>
          <H4>Company Information</H4>
          <P>
            <Cyan>Company:</Cyan> Pascat Graphics & Marketing Company
            <br />
            <Cyan>Division:</Cyan> ZipLogic AI
            <br />
            <Cyan>Email:</Cyan> <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
            <br />
            <Cyan>Jurisdiction:</Cyan> Virginia, United States
          </P>
        </Contact>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 1. TERMS OF SERVICE                                         */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="tos">
          <H2>1. TERMS OF SERVICE</H2>

          <Alert type="red">
            <Red>âš ï¸ BINDING AGREEMENT:</Red>{" "}
            <span className="text-slate-300">
              By creating an account or using ZipLogic AI, you agree to these
              Terms. If you do not agree, do not use the platform.
            </span>
          </Alert>

          <H3>1.1 Acceptance of Terms</H3>
          <P>
            These Terms of Service ("Terms") constitute a legally binding agreement
            between you ("User," "you," or "your") and{" "}
            <Cyan>Pascat Graphics & Marketing Company</Cyan> ("we," "us," or
            "our"), operator of ZipLogic AI. By accessing or using ZipLogic AI,
            you acknowledge that you have read, understood, and agree to be bound
            by these Terms.
          </P>

          <H3>1.2 Account Requirements</H3>
          <UL>
            <li>You must be at least <Red>13 years old</Red> to use ZipLogic AI</li>
            <li>You must provide <strong>accurate and complete registration information</strong></li>
            <li><strong>One account per person</strong> â€” sharing credentials is prohibited</li>
            <li>You are <strong>responsible for all activity</strong> under your account</li>
            <li>You must keep your password secure and notify us immediately of unauthorized access</li>
            <li>We may suspend or terminate accounts that violate these Terms</li>
          </UL>

          <H3>1.3 Subscription Plans & Billing</H3>
          <P>ZipLogic AI offers multiple subscription tiers:</P>
          <UL>
            <li><strong>Free Plan:</strong> 1 project</li>
            <li><strong>Builder Plan ($149/month):</strong> 5 projects</li>
            <li><strong>Professional Plan ($299/month):</strong> 15 projects</li>
            <li><strong>Agency Plan ($599/month):</strong> 30 projects</li>
          </UL>

          <P><strong>Billing Terms:</strong></P>
          <UL>
            <li>Plan limits are <strong>enforced per account</strong></li>
            <li>Paid subscriptions are <strong>billed through Stripe</strong></li>
            <li>You may upgrade, downgrade, or cancel at any time</li>
            <li>Billing is monthly based on your selected plan</li>
            <li>Unused project credits <strong>do not roll over</strong> between billing periods</li>
            <li>Downgrading may result in loss of access to projects exceeding your new plan limit</li>
          </UL>

          <H3>1.4 AI-Generated Code: Ownership & Licensing</H3>

          <Alert type="red">
            <Red>ðŸ”¥ CRITICAL â€” READ CAREFULLY</Red>
          </Alert>

          <H4>Your Prompts</H4>
          <P>
            You retain ownership of all prompts, requirements, and specifications
            you provide to ZipLogic AI.
          </P>

          <H4>Generated Code License</H4>
          <P>
            When you generate a project, you receive a{" "}
            <Cyan>single-project license</Cyan> that allows you to:
          </P>
          <UL>
            <li>Use the code for <Green>one production project</Green></li>
            <li>Modify, customize, and extend the generated code</li>
            <li>Deploy it commercially</li>
            <li>Host it on your own infrastructure</li>
          </UL>

          <P><Red>ðŸš« You are PROHIBITED from:</Red></P>
          <UL>
            <li><strong>Redistributing</strong> the generated code to others</li>
            <li><strong>Reselling</strong> the generated code as a product or template</li>
            <li><strong>Sublicensing</strong> the code to third parties</li>
            <li><strong>Sharing</strong> the codebase (except with your direct team working on that specific project)</li>
            <li><strong>Removing or modifying</strong> license headers, fingerprints, or protection mechanisms</li>
            <li><strong>Using the same generated code</strong> for multiple separate projects</li>
          </UL>

          <H4>ZipLogic's Intellectual Property</H4>
          <P>ZipLogic AI retains all rights to:</P>
          <UL>
            <li>The multi-agent pipeline architecture</li>
            <li>Code templates and frameworks used in generation</li>
            <li>The AI models, prompts, and generation logic</li>
            <li>Code protection systems (fingerprinting, honeypots, obfuscation)</li>
            <li>The ZipLogic AI platform, branding, and trademarks</li>
          </UL>

          <Alert type="amber">
            <strong>âš ï¸ LICENSE ENFORCEMENT:</strong>{" "}
            <span className="text-slate-300">
              We actively monitor for license violations through code fingerprinting
              and honeypot detection. Violations may result in account termination
              and legal action.
            </span>
          </Alert>

          <H3>1.5 Code Protection & Fingerprinting</H3>
          <P>All generated code includes embedded protection mechanisms:</P>
          <UL>
            <li><Cyan>Digital Fingerprints:</Cyan> Unique identifiers linking code to your account and project</li>
            <li><Green>License Keys:</Green> Cryptographic keys validating authorized usage</li>
            <li><Red>Honeypot Markers:</Red> Hidden validation points detecting unauthorized redistribution</li>
            <li><strong>Optional Obfuscation:</strong> Code may be partially obfuscated to prevent reverse engineering</li>
          </UL>

          <Alert type="red">
            <Red>ðŸš« CRITICAL:</Red>{" "}
            <span className="text-slate-300">
              Circumventing, removing, or modifying these protections is a material
              breach of these Terms and may result in immediate termination and
              legal action.
            </span>
          </Alert>

          <H3>1.6 NO REFUNDS POLICY</H3>

          <Alert type="red">
            <Red>ðŸš« ALL SALES ARE FINAL â€” NO REFUNDS</Red>
          </Alert>

          <P>
            ZipLogic AI operates on a <Red>strict NO REFUNDS policy</Red>. This
            means:
          </P>
          <UL>
            <li><Red>No refunds</Red> for any reason, including change of mind</li>
            <li><Red>No refunds</Red> for unused project credits</li>
            <li><Red>No refunds</Red> for partial months or downgraded plans</li>
            <li><Red>No refunds</Red> if you are unsatisfied with generated code quality</li>
            <li><Red>No refunds</Red> if your account is terminated for policy violations</li>
            <li><Red>No refunds</Red> for technical issues, bugs, or service interruptions</li>
          </UL>

          <P>
            <Red>
              âš ï¸ By subscribing, you acknowledge and accept this NO REFUNDS
              policy.
            </Red>
          </P>
          <P>
            For billing errors only, contact{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>{" "}
            within 7 days.
          </P>

          <H3>1.7 Beta Program & Service Availability</H3>

          <Alert type="amber">
            <strong>âš ï¸ ZipLogic AI is currently in BETA</strong>
          </Alert>

          <P><strong>Beta Terms:</strong></P>
          <UL>
            <li>The service is provided <Red>"AS-IS"</Red> during beta</li>
            <li>No uptime guarantees or SLAs during beta period</li>
            <li>Features may change, be added, or removed without notice</li>
            <li>Bugs and unexpected behavior may occur</li>
            <li>We may reset or migrate data with advance notice</li>
          </UL>

          <P>
            <strong>Service Availability:</strong> We strive for high availability
            but do not guarantee uninterrupted access. We may suspend service for
            maintenance, updates, or emergency repairs with or without notice.
          </P>

          <P>
            <strong>Generated Code Quality:</strong> While we aim for
            production-ready code, AI-generated output may contain bugs, security
            vulnerabilities, or design flaws.{" "}
            <Red>
              You are responsible for reviewing, testing, and validating all
              generated code before deployment.
            </Red>
          </P>

          <H3>1.8 Termination</H3>

          <H4>You May Terminate</H4>
          <P>
            Cancel your account at any time through account settings. Paid
            subscriptions are non-refundable as outlined in our NO REFUNDS policy.
          </P>

          <H4>We May Terminate</H4>
          <P>We reserve the right to suspend or terminate accounts for:</P>
          <UL>
            <li>Violation of these Terms or Acceptable Use Policy</li>
            <li>Non-payment of fees</li>
            <li>Fraudulent activity or abuse</li>
            <li>License violations (code redistribution, protection circumvention)</li>
            <li>At our discretion with or without cause (with notice if possible)</li>
          </UL>

          <H4>Effect of Termination</H4>
          <UL>
            <li>Your access to the platform is immediately revoked</li>
            <li>Your data will be deleted per our Privacy Policy</li>
            <li>Licenses for previously generated code remain valid unless terminated for cause</li>
            <li>You must cease using the ZipLogic platform and branding</li>
          </UL>

          <H3>1.9 Changes to Terms</H3>
          <P>
            We may update these Terms from time to time. We will notify you of
            material changes via email or prominent notice on our platform.
            Continued use after changes constitutes acceptance.
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 2. PRIVACY POLICY                                           */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="privacy">
          <H2>2. PRIVACY POLICY (GDPR + CCPA + CPRA Compliant)</H2>

          <Alert type="cyan">
            <span className="text-slate-300">
              ZipLogic AI, operated by{" "}
              <Cyan>Pascat Graphics & Marketing Company</Cyan>, is committed to
              protecting your privacy. This policy explains how we collect, use,
              disclose, and safeguard your information.
            </span>
          </Alert>

          <H3>2.1 Information We Collect</H3>

          <H4>Account Information</H4>
          <P>
            Name, email address, username, and encrypted password. We never store
            your actual password - only a secure hash.
          </P>

          <H4>Payment Information</H4>
          <P>
            Processed entirely through <strong>Stripe</strong>. We never see or
            store your credit card numbers, CVV, or banking details. We only
            receive confirmation of successful payments and subscription status
            from Stripe.
          </P>

          <H4>Usage Data</H4>
          <P>
            Projects generated, tokens consumed, subscription plan, features used,
            generation timestamps, download activity, and API usage patterns.
          </P>

          <H4>Technical Data</H4>
          <P>
            Browser type, device information, IP address, operating system, session
            cookies, and authentication tokens.
          </P>

          <H4>Generated Content</H4>
          <P>
            Your prompts and the code we generate for you. This is stored to enable
            re-downloading, version history, and to improve our AI models.
          </P>

          <H4>Beta Feedback</H4>
          <P>
            During our beta period: bug reports, feature ratings, suggestions, and
            any feedback you voluntarily provide.
          </P>

          <H3>2.2 How We Use Your Information</H3>
          <UL>
            <li><strong>Platform Operations:</strong> To provide, maintain, and improve ZipLogic AI services</li>
            <li><strong>Account Management:</strong> User authentication, profile management, subscription handling</li>
            <li><strong>Payment Processing:</strong> Billing, invoicing, subscription management via Stripe</li>
            <li><strong>Security:</strong> Fraud prevention, rate limiting, account protection, security alerts</li>
            <li><strong>Code Protection:</strong> License enforcement, fingerprint validation, honeypot monitoring</li>
            <li><strong>Service Improvement:</strong> AI model training, pipeline optimization, bug fixes</li>
            <li><strong>Communication:</strong> OTP codes, password resets, security notifications, important updates</li>
            <li><strong>Beta Program:</strong> Collecting and responding to feedback, improving the product</li>
            <li><strong>Legal Compliance:</strong> Responding to legal requests, enforcing our terms</li>
          </UL>

          <H3>2.3 Code Protection & Fingerprinting</H3>
          <P>
            All generated code includes <Red>digital fingerprints</Red>,{" "}
            <Cyan>license keys</Cyan>, and <Green>honeypot markers</Green>. These
            are used exclusively for:
          </P>
          <UL>
            <li>Verifying license compliance</li>
            <li>Detecting unauthorized redistribution</li>
            <li>Enforcing single-project usage terms</li>
            <li>Protecting our intellectual property</li>
          </UL>

          <Alert type="amber">
            <strong>âš ï¸ IMPORTANT:</strong>{" "}
            <span className="text-slate-300">
              We do NOT use fingerprints for user surveillance, tracking, or
              behavioral analysis. They exist solely for license enforcement.
            </span>
          </Alert>

          <H3>2.4 Third-Party Services</H3>

          <H4>Stripe (Payment Processing)</H4>
          <P>
            Handles all payment transactions. Subject to{" "}
            <Link href="https://stripe.com/privacy">Stripe's Privacy Policy</Link>.
          </P>

          <H4>Email Service Provider</H4>
          <P>
            For OTP verification codes, password resets, and critical security
            notifications.
          </P>

          <H4>AI/LLM Providers</H4>
          <P>
            Your prompts are processed through third-party AI services (like
            OpenAI) to generate code. These services may use your prompts to
            improve their models unless you opt out through their platform.
          </P>

          <Alert type="red">
            <Red>ðŸš« WE DO NOT SELL YOUR DATA.</Red>{" "}
            <span className="text-slate-300">
              We do NOT share it with advertisers. We do NOT use it for marketing
              to third parties.
            </span>
          </Alert>

          <H3>2.5 Data Retention & Deletion</H3>

          <H4>Active Accounts</H4>
          <P>Your data is retained as long as your account is active.</P>

          <H4>Deleted Accounts</H4>
          <P>
            Within <strong>30 days</strong> of account deletion, we permanently
            purge your personal data, generated projects, and usage history.
          </P>

          <H4>Legal Holds</H4>
          <P>
            Some data may be retained longer if required for fraud investigations,
            legal compliance, or license disputes.
          </P>

          <H4>Backups</H4>
          <P>
            Backup systems may retain deleted data for up to 90 days before
            automatic purging.
          </P>

          <H3>2.6 Your Rights (GDPR & CCPA/CPRA)</H3>

          <H4>GDPR (European Users)</H4>
          <P>We process your data under the following lawful bases:</P>
          <UL>
            <li><strong>Consent:</strong> When you create an account</li>
            <li><strong>Contract:</strong> To provide our services</li>
            <li><strong>Legitimate Interests:</strong> For fraud prevention and security</li>
          </UL>
          <P>
            You have the right to lodge a complaint with your local supervisory
            authority.
          </P>

          <H4>CCPA/CPRA (California Users)</H4>
          <P>You have the right to:</P>
          <UL>
            <li>Know what personal information is collected</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of the sale of personal information</li>
          </UL>

          <Alert type="cyan">
            <Green>âœ… WE DO NOT SELL PERSONAL INFORMATION.</Green>
          </Alert>

          <H4>Your Data Rights</H4>
          <UL>
            <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
            <li><strong>Correction:</strong> Update inaccurate information through your account settings</li>
            <li><strong>Deletion:</strong> Request account deletion (permanent and irreversible)</li>
            <li><strong>Portability:</strong> Download your generated projects at any time</li>
            <li><strong>Objection:</strong> Object to certain data processing activities</li>
          </UL>

          <P>
            To exercise these rights, contact us at{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
          </P>

          <H3>2.7 Children's Privacy</H3>
          <P>
            ZipLogic AI is <Red>not intended for children under 13</Red>. We do
            not knowingly collect personal information from children. If you
            believe a child has provided us with personal data, contact us
            immediately at{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>{" "}
            and we will delete it.
          </P>

          <H3>2.8 Security Measures</H3>
          <P>We implement industry-standard security measures:</P>
          <UL>
            <li><strong>Encrypted Transmission:</strong> TLS/SSL for all data in transit</li>
            <li><strong>Password Security:</strong> Bcrypt hashing with salt</li>
            <li><strong>Rate Limiting:</strong> Protection against brute force attacks</li>
            <li><strong>OTP Verification:</strong> Two-factor authentication for sensitive actions</li>
            <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
            <li><strong>Access Controls:</strong> Role-based permissions for internal team</li>
          </UL>

          <Alert type="amber">
            <strong>âš ï¸ NOTICE:</strong>{" "}
            <span className="text-slate-300">
              No system is 100% secure, but we take every reasonable precaution to
              protect your data.
            </span>
          </Alert>

          <H3>2.9 International Data Transfers</H3>
          <P>
            ZipLogic AI operates globally. Your data may be transferred to and
            processed in countries outside your residence. We ensure adequate
            safeguards are in place through standard contractual clauses and
            compliance with applicable data protection laws.
          </P>

          <H3>2.10 Changes to This Policy</H3>
          <P>
            We may update this Privacy Policy from time to time. We will notify you
            of material changes via email or prominent notice on our platform.
            Continued use after changes constitutes acceptance.
          </P>

          <H3>2.11 Contact Information</H3>
          <Contact>
            <P>
              <Cyan>Privacy Inquiries:</Cyan>{" "}
              <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
              <br />
              <Cyan>Company:</Cyan> Pascat Graphics & Marketing Company
              <br />
              <Cyan>Division:</Cyan> ZipLogic AI
              <br />
              <Cyan>Jurisdiction:</Cyan> Virginia, United States
              <br />
              <Cyan>Response Time:</Cyan> 5-7 business days
            </P>
          </Contact>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 3. AI USE & OUTPUT DISCLOSURE                                */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="ai">
          <H2>3. AI USE & OUTPUT DISCLOSURE</H2>

          <Alert type="red">
            <Red>âš ï¸ CRITICAL DISCLOSURE:</Red>{" "}
            <span className="text-slate-300">
              AI-generated code may be inaccurate, incomplete, insecure, or contain
              errors. You are solely responsible for reviewing, testing, and
              validating all code before deployment.
            </span>
          </Alert>

          <H3>3.1 Nature of AI-Generated Code</H3>
          <P>
            ZipLogic AI uses large language models (LLMs) and multi-agent systems
            to generate software code based on your prompts. You acknowledge and
            understand that:
          </P>
          <UL>
            <li>AI models are <Red>probabilistic</Red>, not deterministic</li>
            <li>Generated code may contain <strong>bugs, security vulnerabilities, or logical errors</strong></li>
            <li>Code may not fully implement your requirements</li>
            <li>AI cannot guarantee compliance with specific standards or regulations</li>
            <li>Generated code reflects patterns learned from training data, which may be outdated</li>
          </UL>

          <H3>3.2 No Professional Advice</H3>

          <Alert type="red">
            <Red>ðŸš« ZipLogic AI DOES NOT PROVIDE:</Red>
          </Alert>

          <UL>
            <li><strong>Legal advice</strong> or compliance guidance</li>
            <li><strong>Financial advice</strong> or trading recommendations</li>
            <li><strong>Medical advice</strong> or health information</li>
            <li><strong>Security audits</strong> or penetration testing</li>
            <li><strong>Professional engineering services</strong></li>
          </UL>

          <P>
            <Red>
              If you need professional advice in any of these areas, consult a
              qualified professional.
            </Red>
          </P>

          <H3>3.3 User Responsibility for Generated Code</H3>
          <P>YOU are responsible for:</P>
          <UL>
            <li><strong>Reviewing</strong> all generated code thoroughly</li>
            <li><strong>Testing</strong> code in development environments before production</li>
            <li><strong>Security auditing</strong> for vulnerabilities</li>
            <li><strong>Compliance</strong> with applicable laws and regulations</li>
            <li><strong>Licensing</strong> of any third-party dependencies</li>
            <li><strong>Data protection</strong> and user privacy in deployed applications</li>
            <li><strong>Monitoring</strong> and maintaining deployed code</li>
          </UL>

          <H3>3.4 AI Model Training</H3>
          <P>Your prompts and generated code may be used to:</P>
          <UL>
            <li>Improve our AI models and generation pipeline</li>
            <li>Train future versions of ZipLogic AI</li>
            <li>Identify and fix bugs or errors</li>
          </UL>
          <P>
            We do NOT share your prompts or code with third parties for marketing
            purposes.
          </P>

          <H3>3.5 Output Accuracy & Reliability</H3>

          <Alert type="amber">
            <strong>âš ï¸ NO GUARANTEES:</strong>{" "}
            <span className="text-slate-300">
              We make no guarantees about the accuracy, reliability, completeness,
              or fitness for any particular purpose of AI-generated code.
            </span>
          </Alert>

          <P>
            Generated code is provided <Red>"AS-IS"</Red> without warranty of any
            kind.
          </P>

          <H3>3.6 Intellectual Property in Training Data</H3>
          <P>
            AI models may have been trained on publicly available code, which may
            include open-source projects. While we strive to avoid direct copying:
          </P>
          <UL>
            <li>Generated code may occasionally resemble existing codebases</li>
            <li>You are responsible for ensuring generated code does not infringe third-party rights</li>
            <li>We respond promptly to valid DMCA notices (see DMCA Policy)</li>
          </UL>

          <H3>3.7 Deterministic Output</H3>
          <P>
            ZipLogic AI aims for <strong>deterministic output</strong> â€” the same
            prompt should generate identical results. However:
          </P>
          <UL>
            <li>Model updates may change output</li>
            <li>Edge cases may produce variations</li>
            <li>We do not guarantee identical results across different versions</li>
          </UL>

          <H3>3.8 Compliance & Regulations</H3>
          <P>
            If you deploy generated code in regulated industries (healthcare,
            finance, etc.), YOU are responsible for:
          </P>
          <UL>
            <li>Ensuring HIPAA, PCI-DSS, SOC 2, or other compliance</li>
            <li>Conducting required audits and certifications</li>
            <li>Implementing necessary controls and safeguards</li>
          </UL>
          <P>
            <Red>
              ZipLogic AI does not certify or guarantee compliance with any
              regulatory framework.
            </Red>
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 4. ACCEPTABLE USE POLICY                                     */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="aup">
          <H2>4. ACCEPTABLE USE POLICY</H2>

          <Alert type="amber">
            <span className="text-slate-300">
              This policy outlines prohibited uses of ZipLogic AI. Violations may
              result in immediate account suspension or termination without refund.
            </span>
          </Alert>

          <H3>4.1 Prohibited Content Generation</H3>
          <P><Red>ðŸš« You may NOT use ZipLogic AI to generate:</Red></P>
          <UL>
            <li><strong>Malware or Malicious Code:</strong> Viruses, trojans, ransomware, keyloggers, spyware, or any code designed to harm systems or users</li>
            <li><strong>Exploits:</strong> Security vulnerability exploits, hacking tools, password crackers, or penetration testing tools (without explicit authorization)</li>
            <li><strong>Deceptive Software:</strong> Phishing pages, fake login forms, scam websites, or impersonation tools</li>
            <li><strong>Spam Tools:</strong> Email harvesters, mass messaging systems, or automated spam generators</li>
            <li><strong>IP-Infringing Software:</strong> Code that violates patents, copyrights, trademarks, or trade secrets</li>
            <li><strong>Illegal Content:</strong> Software for illegal gambling, drug sales, weapons trafficking, or other criminal activities</li>
            <li><strong>Privacy-Violating Tools:</strong> Unauthorized surveillance software, stalkerware, or data scrapers</li>
          </UL>

          <H3>4.2 Prohibited Platform Abuse</H3>
          <UL>
            <li><strong>Plan Limit Circumvention:</strong> Creating multiple accounts to bypass project limits</li>
            <li><strong>Rate Limiting Bypass:</strong> Using automated tools to circumvent rate limits or usage restrictions</li>
            <li><strong>Platform Scraping:</strong> Crawling, scraping, or reverse engineering the ZipLogic platform</li>
            <li><strong>Unauthorized Access:</strong> Attempting to access other users' accounts or data</li>
            <li><strong>Resource Abuse:</strong> Excessive API calls designed to degrade service performance</li>
            <li><strong>Credential Sharing:</strong> Sharing account credentials with others</li>
          </UL>

          <H3>4.3 Prohibited Code Distribution</H3>
          <UL>
            <li><strong>Redistribution:</strong> Sharing, selling, or giving away generated code</li>
            <li><strong>Template Resale:</strong> Selling generated code as templates or starter kits</li>
            <li><strong>Multi-Project Reuse:</strong> Using the same generated codebase for multiple separate projects</li>
            <li><strong>Protection Removal:</strong> Removing license headers, fingerprints, or protection mechanisms</li>
            <li><strong>Code Laundering:</strong> Attempting to obfuscate origin to evade license enforcement</li>
          </UL>

          <H3>4.4 Prohibited Commercial Activities</H3>
          <UL>
            <li><strong>Competing Services:</strong> Using ZipLogic to build competing AI code generation platforms</li>
            <li><strong>Unauthorized Resale:</strong> Reselling ZipLogic services or projects without our written permission</li>
            <li><strong>White-Labeling:</strong> Removing ZipLogic branding and presenting generated code as your own SaaS product</li>
          </UL>

          <H3>4.5 Responsible AI Use</H3>
          <UL>
            <li><strong>Prompt Injection:</strong> Attempting to manipulate our AI agents through adversarial prompts</li>
            <li><strong>Data Extraction:</strong> Trying to extract training data or model weights</li>
            <li><strong>Bias Exploitation:</strong> Intentionally triggering harmful biases in generated content</li>
          </UL>

          <H3>4.6 Legal Compliance</H3>
          <P>You must comply with all applicable laws and regulations, including:</P>
          <UL>
            <li>Data protection laws (GDPR, CCPA, etc.)</li>
            <li>Export control regulations</li>
            <li>Intellectual property laws</li>
            <li>Computer fraud and abuse laws</li>
            <li>Industry-specific regulations (HIPAA, PCI-DSS, etc. if applicable)</li>
          </UL>

          <H3>4.7 Enforcement & Consequences</H3>
          <P><strong>Violations of this policy may result in:</strong></P>
          <UL>
            <li><strong>Warning:</strong> First-time minor violations</li>
            <li><strong>Temporary Suspension:</strong> Repeat or moderate violations</li>
            <li><Red>Permanent Termination:</Red> Severe or repeated violations</li>
            <li><Red>Legal Action:</Red> Criminal activity, license violations, or significant damages</li>
            <li><Red>License Revocation:</Red> Previously generated code licenses may be revoked for cause</li>
          </UL>
          <P>
            All enforcement actions are at our sole discretion.{" "}
            <Red>Terminated accounts are not eligible for refunds.</Red>
          </P>

          <H3>4.8 Reporting Violations</H3>
          <P>
            If you become aware of violations of this policy, please report them
            to:{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
          </P>
          <P>
            We investigate all reports and take appropriate action. Reporter
            confidentiality is maintained where possible.
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 5. NO REFUND POLICY                                          */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="refund">
          <H2>5. NO REFUND POLICY</H2>

          <Alert type="red">
            <Red>ðŸš« ALL SALES ARE FINAL â€” ABSOLUTELY NO REFUNDS</Red>
          </Alert>

          <H3>5.1 No Refunds Policy</H3>
          <P>
            ZipLogic AI operates on a <Red>strict NO REFUNDS policy</Red>. Once
            you purchase a subscription or make a payment, it is{" "}
            <strong>final and non-refundable</strong> under any circumstances.
          </P>

          <Alert type="amber">
            <strong>
              âš ï¸ By subscribing to or purchasing any ZipLogic AI service, you
              acknowledge and accept this NO REFUNDS policy.
            </strong>
          </Alert>

          <H3>5.2 Non-Refundable Situations</H3>
          <P><Red>ðŸš« Refunds will NOT be issued for:</Red></P>
          <UL>
            <li><strong>Change of Mind:</strong> If you simply decide you no longer need the service</li>
            <li><strong>Unused Projects:</strong> Unused project credits do not roll over and are not refundable</li>
            <li><strong>Partial Months:</strong> Monthly subscriptions are not prorated for partial months</li>
            <li><strong>Account Termination:</strong> No refunds if your account is terminated for violating our Terms</li>
            <li><strong>User Error:</strong> Mistakes in project generation, incorrect prompts, or misuse of features</li>
            <li><strong>Third-Party Issues:</strong> Problems with your deployment, hosting, or external services</li>
            <li><strong>Dissatisfaction:</strong> Unsatisfactory results, code quality issues, or unmet expectations</li>
            <li><strong>Technical Issues:</strong> Bugs, service interruptions, or temporary outages</li>
            <li><strong>Beta Program:</strong> Issues arising from beta features or experimental functionality</li>
          </UL>

          <H3>5.3 Subscription Cancellations</H3>

          <H4>How to Cancel</H4>
          <P>
            You can cancel your subscription at any time through your account
            Settings page. Cancellations take effect at the end of your current
            billing period.
          </P>

          <H4>After Cancellation</H4>
          <UL>
            <li>You retain access until the end of your paid period</li>
            <li><Red>No refund</Red> for the remaining days of your current period</li>
            <li>Your account converts to the Free plan (1 project limit)</li>
            <li>Projects exceeding the Free plan limit become read-only</li>
          </UL>

          <H4>Reactivation</H4>
          <P>
            You can reactivate your subscription at any time. Your previous
            projects will be restored if within the account data retention period.
          </P>

          <H3>5.4 Downgrades</H3>
          <P>If you downgrade to a lower-tier plan:</P>
          <UL>
            <li>The change takes effect at the end of your current billing period</li>
            <li><Red>No refund</Red> for the difference in plan pricing</li>
            <li>Projects exceeding your new plan limit become read-only</li>
            <li>You can upgrade again at any time</li>
          </UL>

          <H3>5.5 Upgrades</H3>
          <P>If you upgrade to a higher-tier plan:</P>
          <UL>
            <li>The change takes effect immediately</li>
            <li>You'll be charged the prorated difference for the remainder of your billing period</li>
            <li>Your next billing cycle will be at the new plan rate</li>
          </UL>

          <H3>5.6 Billing Errors (Only Exception)</H3>
          <P>If you believe you were charged in error due to a billing system malfunction:</P>
          <UL>
            <li>Contact us at <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link> within <strong>7 days</strong></li>
            <li>Provide your transaction ID and explanation</li>
            <li>We'll investigate and issue a refund if a system error occurred</li>
          </UL>

          <Alert type="amber">
            <strong>âš ï¸ IMPORTANT:</strong>{" "}
            <span className="text-slate-300">
              This exception applies ONLY to billing system errors (duplicate
              charges, incorrect amounts). It does NOT apply to dissatisfaction,
              change of mind, or any other reason.
            </span>
          </Alert>

          <H3>5.7 Chargebacks</H3>

          <Alert type="red">
            <strong>âš ï¸ Please contact us before filing a chargeback</strong>
          </Alert>

          <P>
            Chargebacks should be a last resort. If you file a chargeback before
            contacting us:
          </P>
          <UL>
            <li>Your account will be immediately suspended</li>
            <li>Access to all generated projects will be revoked</li>
            <li>We may pursue the claim through your payment processor</li>
            <li>Your IP address may be banned from creating future accounts</li>
          </UL>

          <P>
            We're happy to work with you to resolve billing issues. Just reach out
            to us first at{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
          </P>

          <H3>5.8 Contact for Billing Issues</H3>
          <Contact>
            <P>
              <Cyan>Billing & Payment Issues:</Cyan>{" "}
              <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
              <br />
              <Cyan>Response Time:</Cyan> 3-5 business days
            </P>
          </Contact>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 6. LIMITATION OF LIABILITY                                   */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="liability">
          <H2>6. LIMITATION OF LIABILITY & INDEMNIFICATION</H2>

          <Alert type="red">
            <Red>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</Red>
          </Alert>

          <H3>6.1 Limitation of Liability</H3>
          <P>
            ZipLogic AI and Pascat Graphics & Marketing Company provide the
            service <Red>"AS-IS"</Red> and <Red>"AS-AVAILABLE"</Red> with all
            faults and without warranty of any kind.
          </P>

          <H4>No Warranties</H4>
          <P>We make <Red>no warranties</Red> regarding:</P>
          <UL>
            <li>Code quality, functionality, security, or fitness for any particular purpose</li>
            <li>Accuracy, reliability, or completeness of AI-generated code</li>
            <li>Uninterrupted or error-free operation</li>
            <li>Compatibility with your systems or requirements</li>
            <li>Meeting your business objectives or expectations</li>
          </UL>

          <H4>Disclaimer of Damages</H4>
          <P>
            We are <Red>not liable</Red> for any damages arising from use of
            generated code or the platform, including but not limited to:
          </P>
          <UL>
            <li><strong>Data loss</strong> or corruption</li>
            <li><strong>Revenue loss</strong> or business interruption</li>
            <li><strong>Security breaches</strong> or vulnerabilities</li>
            <li><strong>Regulatory fines</strong> or compliance failures</li>
            <li><strong>Intellectual property infringement</strong> claims</li>
            <li><strong>Consequential, incidental, or punitive damages</strong></li>
          </UL>

          <H4>Liability Cap</H4>
          <P>
            Our total liability is limited to the{" "}
            <Cyan>amount you paid in the 12 months preceding the claim</Cyan>. If
            you're on the Free plan, our liability is capped at $100 USD.
          </P>

          <H4>Third-Party Services</H4>
          <P>We are not responsible for:</P>
          <UL>
            <li>Stripe payment processing failures</li>
            <li>AI provider (e.g., OpenAI) outages or errors</li>
            <li>Your hosting infrastructure or deployment issues</li>
            <li>Internet connectivity problems</li>
          </UL>

          <H3>6.2 Indemnification</H3>
          <P>
            You agree to <strong>indemnify and hold harmless</strong> Pascat
            Graphics & Marketing Company, ZipLogic AI, and our officers,
            directors, employees, and agents from any claims, damages, losses, or
            expenses (including reasonable attorneys' fees) arising from:
          </P>
          <UL>
            <li>Your use of the platform</li>
            <li>Your deployment of generated code</li>
            <li>Violation of these Terms</li>
            <li>Infringement of third-party rights</li>
            <li>Your breach of any laws or regulations</li>
            <li>Harm caused by your deployed applications</li>
            <li>Data breaches in your deployed code</li>
          </UL>

          <H3>6.3 Force Majeure</H3>
          <P>
            We are not liable for delays or failures caused by circumstances
            beyond our reasonable control, including:
          </P>
          <UL>
            <li>Natural disasters</li>
            <li>Pandemics or public health emergencies</li>
            <li>War, terrorism, or civil unrest</li>
            <li>Internet infrastructure failures</li>
            <li>Third-party service provider outages</li>
            <li>Government actions or regulations</li>
          </UL>

          <H3>6.4 Jurisdictional Variations</H3>
          <P>
            Some jurisdictions do not allow certain liability limitations, so these
            may not apply to you. In such cases, our liability is limited to the
            minimum extent permitted by law.
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 7. COOKIE POLICY                                             */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="cookies">
          <H2>7. COOKIE POLICY</H2>

          <Alert type="cyan">
            <span className="text-slate-300">
              ZipLogic AI uses cookies and similar technologies to provide, secure,
              and improve our service. This policy explains what cookies we use and
              why.
            </span>
          </Alert>

          <H3>7.1 What Are Cookies?</H3>
          <P>
            Cookies are small text files stored on your device by your web browser.
            They allow websites to remember your preferences, authenticate you, and
            track your usage patterns.
          </P>

          <H3>7.2 Essential Cookies (Required)</H3>
          <P>
            These cookies are necessary for the platform to function and cannot be
            disabled:
          </P>

          <H4>Authentication Tokens</H4>
          <UL>
            <li><strong>Purpose:</strong> Keep you logged in securely</li>
            <li><strong>Duration:</strong> Session or 30 days (if "Remember Me" selected)</li>
            <li><strong>Data:</strong> Encrypted JWT token</li>
          </UL>

          <H4>Session Management</H4>
          <UL>
            <li><strong>Purpose:</strong> Track your active session</li>
            <li><strong>Duration:</strong> Until browser closes</li>
            <li><strong>Data:</strong> Session ID</li>
          </UL>

          <H4>CSRF Protection</H4>
          <UL>
            <li><strong>Purpose:</strong> Prevent cross-site request forgery attacks</li>
            <li><strong>Duration:</strong> Session</li>
            <li><strong>Data:</strong> Random security token</li>
          </UL>

          <H3>7.3 Functional Cookies</H3>
          <P>These cookies enhance your experience but are not strictly necessary:</P>

          <H4>User Preferences</H4>
          <UL>
            <li><strong>Purpose:</strong> Remember your UI preferences, theme selection, sidebar state</li>
            <li><strong>Duration:</strong> 1 year</li>
            <li><strong>Data:</strong> Theme choice, layout preferences</li>
          </UL>

          <H4>Feature Flags</H4>
          <UL>
            <li><strong>Purpose:</strong> Remember dismissed banners, completed onboarding</li>
            <li><strong>Duration:</strong> 90 days</li>
            <li><strong>Data:</strong> Boolean flags</li>
          </UL>

          <H3>7.4 Analytics Cookies (Optional)</H3>

          <H4>Usage Analytics</H4>
          <UL>
            <li><strong>Purpose:</strong> Understand feature adoption, identify bugs</li>
            <li><strong>Duration:</strong> 2 years</li>
            <li><strong>Data:</strong> Anonymized usage patterns, page views, click events</li>
            <li><strong>Opt-Out:</strong> Available in Settings</li>
          </UL>

          <H3>7.5 Third-Party Cookies</H3>

          <H4>Stripe Payment Processing</H4>
          <UL>
            <li><strong>Purpose:</strong> Secure payment checkout, fraud prevention</li>
            <li><strong>Policy:</strong> Stripe Cookie Policy</li>
          </UL>

          <Alert type="cyan">
            <Green>âœ… We do NOT use third-party advertising cookies or trackers.</Green>
          </Alert>

          <H3>7.6 Local Storage</H3>
          <P>We also use browser Local Storage for:</P>
          <UL>
            <li><strong>Draft Projects:</strong> Autosave your prompt drafts</li>
            <li><strong>WebSocket State:</strong> Reconnection tokens</li>
            <li><strong>UI Cache:</strong> Faster page loads</li>
          </UL>

          <H3>7.7 Managing Cookies</H3>

          <H4>Browser Settings</H4>
          <P>
            Most browsers allow you to block or delete cookies. Note that blocking
            essential cookies will prevent you from using ZipLogic AI.
          </P>

          <H4>Platform Settings</H4>
          <P>Toggle analytics cookies on/off in your account Settings page.</P>

          <H4>Do Not Track</H4>
          <P>We respect browser "Do Not Track" signals for optional cookies.</P>

          <H3>7.8 Updates to This Policy</H3>
          <P>
            We may update this Cookie Policy as we add or remove features. Changes
            will be reflected with an updated "Last Modified" date. Significant
            changes will be communicated via email.
          </P>

          <H3>7.9 Contact</H3>
          <P>
            Cookie questions? Contact us at{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 8. DATA PROCESSING ADDENDUM                                  */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="dpa">
          <H2>8. DATA PROCESSING ADDENDUM (DPA)</H2>

          <Alert type="cyan">
            <span className="text-slate-300">
              This Data Processing Addendum ("DPA") applies to users in the
              European Economic Area (EEA), United Kingdom, or Switzerland, and
              supplements our Privacy Policy.
            </span>
          </Alert>

          <H3>8.1 Definitions</H3>
          <UL>
            <li><strong>"Controller":</strong> The entity that determines the purposes and means of processing personal data (you, the user)</li>
            <li><strong>"Processor":</strong> The entity that processes personal data on behalf of the Controller (ZipLogic AI/Pascat Graphics)</li>
            <li><strong>"Personal Data":</strong> Any information relating to an identified or identifiable natural person</li>
            <li><strong>"Processing":</strong> Any operation performed on personal data</li>
            <li><strong>"Sub-processor":</strong> A third party engaged by us to process personal data</li>
          </UL>

          <H3>8.2 Roles & Responsibilities</H3>
          <P>For personal data you provide through ZipLogic AI:</P>
          <UL>
            <li><strong>You are the Controller</strong> â€” You determine what data you input and how it's used</li>
            <li><strong>We are the Processor</strong> â€” We process your data according to your instructions (i.e., generating code)</li>
          </UL>

          <H3>8.3 Processing Instructions</H3>
          <P>We will process personal data only:</P>
          <UL>
            <li>As necessary to provide ZipLogic AI services</li>
            <li>As instructed by you through your use of the platform</li>
            <li>As required by applicable law</li>
          </UL>
          <P>We will not:</P>
          <UL>
            <li>Sell your personal data</li>
            <li>Use your data for purposes incompatible with the services</li>
            <li>Retain data longer than necessary</li>
          </UL>

          <H3>8.4 Sub-processors</H3>
          <P>We engage the following sub-processors to provide services:</P>
          <UL>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>OpenAI (or similar):</strong> AI model inference</li>
            <li><strong>Email Service Provider:</strong> Transactional emails</li>
            <li><strong>Cloud Infrastructure Provider:</strong> Hosting and storage</li>
          </UL>
          <P>
            We will notify you of any changes to sub-processors. You may object to
            a new sub-processor on reasonable grounds.
          </P>

          <H3>8.5 Data Security</H3>
          <P>
            We implement appropriate technical and organizational measures to
            protect personal data, including:
          </P>
          <UL>
            <li>Encryption in transit and at rest</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
            <li>Incident response procedures</li>
            <li>Employee training on data protection</li>
          </UL>

          <H3>8.6 Data Breach Notification</H3>
          <P>In the event of a personal data breach, we will:</P>
          <UL>
            <li>Notify you without undue delay (within 72 hours when feasible)</li>
            <li>Provide details of the breach, affected data, and mitigation steps</li>
            <li>Cooperate with you to fulfill your notification obligations to supervisory authorities</li>
          </UL>

          <H3>8.7 Data Subject Rights</H3>
          <P>We will assist you in responding to data subject requests, including:</P>
          <UL>
            <li><strong>Access:</strong> Providing copies of personal data</li>
            <li><strong>Rectification:</strong> Correcting inaccurate data</li>
            <li><strong>Erasure:</strong> Deleting data when no longer necessary</li>
            <li><strong>Portability:</strong> Exporting data in a machine-readable format</li>
            <li><strong>Objection:</strong> Ceasing certain processing activities</li>
          </UL>

          <H3>8.8 International Data Transfers</H3>
          <P>
            If we transfer personal data outside the EEA, we ensure adequate
            safeguards through:
          </P>
          <UL>
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Adequacy decisions by the European Commission</li>
            <li>Other lawful transfer mechanisms under GDPR</li>
          </UL>

          <H3>8.9 Data Retention</H3>
          <P>We retain personal data only as long as necessary for:</P>
          <UL>
            <li>Providing services to you</li>
            <li>Complying with legal obligations</li>
            <li>Resolving disputes and enforcing agreements</li>
          </UL>
          <P>
            Upon termination, we will delete or return your personal data within 30
            days, except where retention is required by law.
          </P>

          <H3>8.10 Audit Rights</H3>
          <P>
            You may request information about our data processing practices. We
            will provide:
          </P>
          <UL>
            <li>Copies of relevant certifications (e.g., SOC 2, ISO 27001 if applicable)</li>
            <li>Summaries of security measures</li>
            <li>Information about sub-processors</li>
          </UL>

          <H3>8.11 Liability & Indemnification</H3>
          <P>
            Each party is liable for damages caused by its breach of this DPA,
            subject to the limitations in our Terms of Service.
          </P>

          <H3>8.12 Term & Termination</H3>
          <P>
            This DPA remains in effect as long as we process personal data on your
            behalf. Upon termination of your account, we will delete or return all
            personal data as outlined in Section 8.9.
          </P>

          <H3>8.13 Governing Law</H3>
          <P>
            This DPA is governed by the laws of Virginia, United States, except
            where GDPR or other data protection laws apply, in which case those
            laws take precedence for data protection matters.
          </P>

          <H3>8.14 Contact for DPA Matters</H3>
          <Contact>
            <P>
              <Cyan>DPA Inquiries:</Cyan>{" "}
              <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
              <br />
              <Cyan>Data Protection Officer:</Cyan> Not currently designated
              (contact general email above)
            </P>
          </Contact>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 9. ARBITRATION & CLASS ACTION WAIVER                         */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="arbitration">
          <H2>9. ARBITRATION & CLASS ACTION WAIVER</H2>

          <Alert type="red">
            <Red>âš ï¸ IMPORTANT:</Red>{" "}
            <span className="text-slate-300">
              This section contains a binding arbitration clause and class action
              waiver. Please read carefully.
            </span>
          </Alert>

          <H3>9.1 Agreement to Arbitrate</H3>
          <P>
            You and Pascat Graphics & Marketing Company agree to resolve any
            disputes arising from or relating to these Terms or ZipLogic AI through{" "}
            <strong>binding arbitration</strong>, rather than in court, except as
            specified below.
          </P>

          <H4>What is Arbitration?</H4>
          <P>
            Arbitration is a form of private dispute resolution where an
            independent arbitrator makes a binding decision after hearing both
            sides. It's usually faster and less expensive than court litigation.
          </P>

          <H3>9.2 Exceptions to Arbitration</H3>
          <P>The following disputes are <strong>NOT</strong> subject to arbitration:</P>
          <UL>
            <li>Small claims court actions (claims under $10,000)</li>
            <li>Intellectual property disputes (trademark, patent, copyright infringement)</li>
            <li>Requests for injunctive relief to stop unauthorized use or abuse of the platform</li>
          </UL>

          <H3>9.3 Arbitration Rules & Procedures</H3>

          <H4>Governing Rules</H4>
          <P>
            Arbitration will be conducted under the{" "}
            <strong>Commercial Arbitration Rules of the American Arbitration Association (AAA)</strong>.
          </P>

          <H4>Initiating Arbitration</H4>
          <P>To begin arbitration, you must send a written notice to:</P>
          <Contact>
            <P>
              <strong>Pascat Graphics & Marketing Company</strong>
              <br />
              Attn: Legal Department - ZipLogic AI
              <br />
              Email: <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
            </P>
          </Contact>
          <P>The notice must describe the nature of the claim and the relief sought.</P>

          <H4>Arbitrator Selection</H4>
          <P>
            The arbitrator will be selected according to AAA rules. The arbitrator
            must be a lawyer with at least 10 years of experience or a retired
            judge.
          </P>

          <H4>Location</H4>
          <P>
            Arbitration will be conducted in <strong>Virginia, United States</strong>,
            or via remote videoconference if both parties agree.
          </P>

          <H4>Costs</H4>
          <UL>
            <li>Each party bears its own attorneys' fees and costs</li>
            <li>AAA filing fees are split equally</li>
            <li>The arbitrator's fees are split equally unless the arbitrator decides otherwise</li>
          </UL>

          <H3>9.4 Class Action Waiver</H3>

          <Alert type="red">
            <Red>ðŸš« NO CLASS ACTIONS:</Red>{" "}
            <span className="text-slate-300">
              You agree to resolve disputes individually, not as part of a class action.
            </span>
          </Alert>

          <P>You and Pascat Graphics & Marketing Company agree that:</P>
          <UL>
            <li>Any arbitration or court proceeding will be conducted <strong>on an individual basis</strong></li>
            <li>You may <strong>NOT</strong> bring claims as a plaintiff or class member in a class action, consolidated action, or representative action</li>
            <li>The arbitrator may <strong>NOT</strong> consolidate multiple parties' claims</li>
            <li>The arbitrator may <strong>NOT</strong> preside over any form of representative or class proceeding</li>
          </UL>

          <P>
            <strong>
              If this class action waiver is found unenforceable, the entire
              arbitration agreement is void, and disputes will be resolved in court.
            </strong>
          </P>

          <H3>9.5 Informal Dispute Resolution</H3>
          <P>
            Before initiating arbitration, you agree to first contact us at{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>{" "}
            to attempt to resolve the dispute informally. We will have{" "}
            <strong>60 days</strong> to resolve the issue before arbitration may be
            initiated.
          </P>

          <H3>9.6 Governing Law</H3>
          <P>
            These Terms and any disputes are governed by the laws of{" "}
            <strong>Virginia, United States</strong>, without regard to conflict of
            law principles.
          </P>

          <H3>9.7 Venue for Court Proceedings</H3>
          <P>
            If arbitration does not apply (e.g., small claims court), any court
            proceedings must be brought in the state or federal courts located in{" "}
            <strong>Virginia, United States</strong>, and you consent to the
            exclusive jurisdiction of those courts.
          </P>

          <H3>9.8 Statute of Limitations</H3>
          <P>
            Any claim or dispute must be filed within{" "}
            <strong>one (1) year</strong> after the claim arises, or it is
            permanently barred.
          </P>

          <H3>9.9 Severability</H3>
          <P>
            If any part of this arbitration agreement is found invalid or
            unenforceable, the rest remains in effect, except as specified in
            Section 9.4.
          </P>

          <H3>9.10 Survival</H3>
          <P>
            This arbitration agreement survives the termination of your account or
            these Terms.
          </P>

          <H3>9.11 Modification</H3>
          <P>
            We may modify this arbitration agreement by providing 30 days' notice.
            Changes do not apply to disputes that arose before the modification
            took effect.
          </P>

          <H3>9.12 Opt-Out Right</H3>
          <P>
            You have the right to opt out of this arbitration agreement within{" "}
            <strong>30 days</strong> of creating your account by sending written
            notice to:
          </P>
          <Contact>
            <P>
              <strong>Pascat Graphics & Marketing Company</strong>
              <br />
              Attn: Arbitration Opt-Out - ZipLogic AI
              <br />
              Email: <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
            </P>
          </Contact>
          <P>
            The opt-out notice must include your name, email address, and a clear
            statement that you wish to opt out of the arbitration agreement. If you
            opt out, all other terms still apply, but disputes will be resolved in
            court.
          </P>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* 10. DMCA POLICY                                              */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div id="dmca">
          <H2>ADDITIONAL POLICIES (DMCA)</H2>

          <H3>DMCA Policy</H3>

          <Alert type="amber">
            <span className="text-slate-300">
              Pascat Graphics & Marketing Company respects intellectual property
              rights and complies with the Digital Millennium Copyright Act (DMCA).
            </span>
          </Alert>

          <H4>Copyright Infringement Claims</H4>
          <P>
            If you believe that content generated through ZipLogic AI infringes
            your copyright, please submit a DMCA takedown notice containing:
          </P>
          <UL>
            <li>Your physical or electronic signature</li>
            <li>Identification of the copyrighted work claimed to be infringed</li>
            <li>Identification of the infringing material (specific generated project URL or code)</li>
            <li>Your contact information (address, telephone, email)</li>
            <li>A statement that you have a good faith belief the use is not authorized</li>
            <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
          </UL>

          <H4>How to File a Claim</H4>
          <Contact>
            <P>
              <Cyan>DMCA Agent:</Cyan>{" "}
              <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
              <br />
              <Cyan>Company:</Cyan> Pascat Graphics & Marketing Company
              <br />
              DMCA Agent - ZipLogic AI Division
            </P>
          </Contact>

          <H4>Counter-Notification</H4>
          <P>
            If your content was removed due to a DMCA claim and you believe it was
            removed in error, you may file a counter-notification containing the
            same information as above plus a statement under penalty of perjury
            that you have a good faith belief the material was removed by mistake.
          </P>

          <H4>Repeat Infringer Policy</H4>
          <P>
            We may terminate accounts of users who repeatedly infringe copyright.
            Users who receive multiple valid DMCA notices may have their accounts
            suspended or terminated without refund.
          </P>

          <H4>AI-Generated Code Considerations</H4>
          <Alert type="amber">
            <strong>âš ï¸ Important Note on AI-Generated Content:</strong>{" "}
            <span className="text-slate-300">
              ZipLogic AI generates code using large language models trained on
              publicly available code. While we take steps to ensure generated code
              does not directly copy copyrighted material, AI models may
              occasionally produce output similar to training data. Users are
              responsible for ensuring their deployed code does not infringe
              third-party rights.
            </span>
          </Alert>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* FINAL CONTACT & JURISDICTION                                 */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <H2>FINAL CONTACT & JURISDICTION</H2>

        <Contact>
          <H3>All Legal Inquiries</H3>
          <P>
            <Cyan>Email:</Cyan>{" "}
            <Link href="mailto:ziplogicai@gmail.com">ziplogicai@gmail.com</Link>
            <br />
            <Cyan>Company:</Cyan> Pascat Graphics & Marketing Company
            <br />
            <Cyan>Division:</Cyan> ZipLogic AI
            <br />
            <Cyan>Jurisdiction:</Cyan> Virginia, United States
            <br />
            <Cyan>Response Time:</Cyan> 3-7 business days
          </P>
        </Contact>

        <Alert type="cyan">
          <strong>ðŸ“„ Last Updated:</strong> February 6, 2026
          <br />
          <strong>ðŸ“„ Effective Date:</strong> February 6, 2026
        </Alert>

        <p className="text-center mt-16 text-slate-500 text-xs">
          Â© 2026 Pascat Graphics & Marketing Company. All rights reserved.
          <br />
          ZipLogic AI is a division of Pascat Graphics & Marketing Company.
        </p>
      </div>
    </div>
  );
}