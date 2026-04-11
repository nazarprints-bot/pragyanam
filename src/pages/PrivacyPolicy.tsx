import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {isHi ? "वापस जाएं" : "Back to Home"}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {isHi ? "गोपनीयता नीति" : "Privacy Policy"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{isHi ? "अंतिम अपडेट: 11 अप्रैल 2026" : "Last Updated: 11th April 2026"}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>PRAGYANAM AI ("we", "our", "us") is committed to protecting the privacy and safety of students, teachers, and parents using our platform. This Privacy Policy explains how we collect, use, store, protect, and manage personal information.</p>
          <p>By accessing or using PRAGYANAM AI, you agree to the practices described in this policy.</p>

          <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect only the information necessary to provide educational services effectively and securely.</p>
          <h3 className="text-base font-semibold text-foreground">A. Student Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full Name, Grade/Class Level, School Name</li>
            <li>Email address, Parent/Guardian contact details (for minors)</li>
            <li>Course enrollment details, Test performance and progress data</li>
            <li>Login activity records</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">B. Teacher Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full Name, Email, Contact details, Teaching experience</li>
            <li>Educational qualification details, Degree certificates</li>
            <li>Professional certifications, Identity verification documents</li>
            <li>Uploaded lecture notes, videos, and test materials</li>
            <li>Payment details (for payouts, if applicable)</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">C. Technical & Usage Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address, Device type, Browser type, Operating system</li>
            <li>App usage logs, Login timestamps, Error reports</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">2. Special Protection for Minors</h2>
          <p>PRAGYANAM AI serves students as young as Class 6. Therefore:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Parental or guardian consent is mandatory for users under 18 years of age.</li>
            <li>We limit collection of minor data to what is strictly required.</li>
            <li>Minor profiles are not publicly visible.</li>
            <li>Parents may request access to their child's data, corrections, or account deletion.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">3. Purpose of Data Collection</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage user accounts</li>
            <li>Verify teacher credentials and qualifications</li>
            <li>Provide access to courses, live classes, and AI-generated tests</li>
            <li>Track student academic progress</li>
            <li>Enable lecture downloads where permitted</li>
            <li>Improve app performance and mobile responsiveness</li>
            <li>Provide customer support</li>
            <li>Prevent fraud, misuse, and unauthorized access</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">4. Teacher Degree & Credential Verification</h2>
          <p>To maintain academic integrity:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We collect teacher degree certificates for verification purposes.</li>
            <li>Documents are reviewed by authorized administrative staff.</li>
            <li>Degree documents are not publicly displayed without explicit consent.</li>
            <li>Documents are stored securely and accessed only when necessary.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">5. AI Feature & Data Processing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Teachers may input topics or notes for AI-generated MCQs.</li>
            <li>Content is processed securely through AI systems.</li>
            <li>We do not use student personal data to train external AI models.</li>
            <li>AI-generated content is used solely within the platform.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">6. Data Sharing Policy</h2>
          <p>We do NOT sell student or teacher personal data to advertisers. Data may be shared only:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>With secure hosting and cloud service providers</li>
            <li>With payment gateways for transaction processing</li>
            <li>If required by law or government authorities</li>
            <li>To prevent fraud or security threats</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">7. Data Storage & Security</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encrypted HTTPS connections</li>
            <li>Secure database infrastructure</li>
            <li>Restricted admin-level access</li>
            <li>Regular updates and monitoring</li>
            <li>Authentication controls</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">8. Data Retention</h2>
          <p>Student and teacher data is retained while accounts remain active. Upon account deletion, personal data is removed within a reasonable timeframe unless legally required. Teacher verification documents are deleted upon account closure unless required for compliance.</p>

          <h2 className="text-lg font-bold text-foreground">9. Cookies & Tracking Technologies</h2>
          <p>We use cookies and similar technologies to maintain login sessions, improve user experience, analyze app performance, and fix errors. Users may disable cookies via browser settings.</p>

          <h2 className="text-lg font-bold text-foreground">10. Subscription & Payment Information</h2>
          <p>Payments are processed through secure third-party payment gateways. We do not store complete debit/credit card details on our servers. Transaction records may be stored for accounting and compliance purposes.</p>

          <h2 className="text-lg font-bold text-foreground">11. User Rights</h2>
          <p>Users (or parents of minors) have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access their personal data</li>
            <li>Request corrections</li>
            <li>Request account deletion</li>
            <li>Withdraw consent (where applicable)</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">12. Compliance with Indian Law</h2>
          <p>PRAGYANAM AI aims to comply with the Information Technology Act, 2000 (India), applicable Indian data protection regulations, child data protection principles, and educational compliance standards.</p>

          <h2 className="text-lg font-bold text-foreground">13. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy periodically. Updates will be reflected by revising the "Last Updated" date. Continued use of PRAGYANAM AI after updates constitutes acceptance of the revised Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
