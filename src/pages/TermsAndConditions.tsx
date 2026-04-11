import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsAndConditions = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {isHi ? "वापस जाएं" : "Back to Home"}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {isHi ? "नियम और शर्तें" : "Terms and Conditions"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{isHi ? "अंतिम अपडेट: 11 अप्रैल 2026" : "Last Updated: 11th April 2026"}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>Welcome to <strong>PRAGYANAM AI</strong>. These Terms and Conditions ("Terms") govern your use of the PRAGYANAM AI platform, including website, mobile application, courses, AI tools, and related services. By accessing or using the platform, you agree to comply with these Terms.</p>

          <h2 className="text-lg font-bold text-foreground">1. Age Eligibility & Parental Consent</h2>
          <p><strong>Minimum Age:</strong> Users must be at least in Class 6 or approximately 11 years of age to register.</p>
          <p><strong>Mandatory Parental Consent:</strong> If a user is under 18 years of age, a parent or legal guardian must review and accept these Terms on the minor's behalf. By allowing a minor to use the platform, the parent/guardian accepts full responsibility for the minor's activity.</p>
          <p><strong>No Maximum Age:</strong> There is no upper age limit. However, all users must follow the code of conduct, especially when interacting in environments involving minors.</p>

          <h2 className="text-lg font-bold text-foreground">2. Educational Content & Intellectual Property</h2>
          <p>PRAGYANAM AI provides Lecture Notes, Practice Tests, AI-generated Tests, Video Lectures, and Live Classes.</p>
          <h3 className="text-base font-semibold text-foreground">Teacher Ownership</h3>
          <p>Teachers retain ownership of the original materials they upload. By uploading content, they grant PRAGYANAM AI a non-exclusive license to host, stream, and display such content to enrolled students.</p>
          <h3 className="text-base font-semibold text-foreground">Student Usage Rights</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>View lectures</li>
            <li>Download notes (where permitted)</li>
            <li>Attempt tests for personal educational use only</li>
          </ul>
          <p>Content may not be reused for commercial purposes.</p>
          <h3 className="text-base font-semibold text-foreground">Anti-Piracy Policy</h3>
          <p>Users are strictly prohibited from:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Screen recording or copying video lectures</li>
            <li>Sharing downloaded PDFs externally</li>
            <li>Selling test banks or answer keys</li>
            <li>Redistributing AI-generated test content</li>
          </ul>
          <p>Violation may result in immediate termination without refund.</p>

          <h2 className="text-lg font-bold text-foreground">3. AI Feature Usage (AI Test Generator)</h2>
          <p>PRAGYANAM AI includes an AI-powered Test Generator feature.</p>
          <h3 className="text-base font-semibold text-foreground">Purpose</h3>
          <p>Teachers can generate MCQ tests automatically using AI based on topic name, notes or study material, and selected question count.</p>
          <h3 className="text-base font-semibold text-foreground">AI Limitations</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>AI-generated content may contain inaccuracies.</li>
            <li>Teachers must review and verify all AI-generated questions before publishing.</li>
            <li>PRAGYANAM AI does not guarantee alignment with official board exams.</li>
          </ul>
          <h3 className="text-base font-semibold text-foreground">Responsible Use</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users must not use AI to generate harmful, inappropriate, or exam-leak content.</li>
            <li>Users must not attempt to reverse engineer AI prompts or backend logic.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">4. Conduct in a K–12 Environment</h2>
          <p>As the platform serves minors, we maintain a Zero-Tolerance Policy for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bullying, harassment, or abusive language</li>
            <li>Academic dishonesty or plagiarism</li>
            <li>Sharing inappropriate content</li>
            <li>Attempting to solicit official exam answers</li>
          </ul>
          <p>Accounts violating these rules may be suspended or permanently banned.</p>

          <h2 className="text-lg font-bold text-foreground">5. Testing & Evaluation Disclaimer</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Practice tests are for self-assessment only.</li>
            <li>AI-generated and manually created tests may not mirror actual board exams.</li>
            <li>Automated grading is indicative only.</li>
            <li>Official academic credit is determined by the student's school/institution.</li>
          </ul>
          <p>PRAGYANAM AI is not responsible for lower-than-expected academic results.</p>

          <h2 className="text-lg font-bold text-foreground">6. Privacy & Data Protection</h2>
          <p>We prioritize student safety. We collect minimal data such as name, grade level, school (if required), and parent contact (for minors).</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not sell student data to third-party advertisers.</li>
            <li>Data is stored securely.</li>
            <li>Parents may request data review or account deletion.</li>
          </ul>

          <h2 className="text-lg font-bold text-foreground">7. Subscription & Payments</h2>
          <p><strong>Billing:</strong> Fees are based on selected plan or course.</p>
          <p><strong>Approval Policy:</strong> Free plan users may require manual approval. Paid plan users are automatically approved upon successful payment verification.</p>
          <p><strong>Auto-Renewal:</strong> If enabled, subscriptions auto-renew unless canceled before the renewal period.</p>
          <p><strong>Refund Policy:</strong> Refunds are processed within 48 hours if no course content has been accessed and refund request is made within 24–48 hours of purchase. Refund eligibility is subject to verification.</p>

          <h2 className="text-lg font-bold text-foreground">8. Account Security</h2>
          <p>Users (and parents) are responsible for maintaining password confidentiality and preventing account sharing. Identity sharing (multiple students using one account) will result in immediate termination without refund.</p>

          <h2 className="text-lg font-bold text-foreground">9. Platform Maintenance & Technical Updates</h2>
          <p>PRAGYANAM AI regularly performs UI improvements, mobile responsiveness updates, database corrections, and feature upgrades. Temporary service interruptions may occur during updates.</p>

          <h2 className="text-lg font-bold text-foreground">10. Limitation of Liability</h2>
          <p>PRAGYANAM AI acts as a hosting and technology intermediary. We are not liable for teacher content quality, AI-generated inaccuracies, academic performance outcomes, device damage, or internet connectivity issues. Use of the platform is at your own risk.</p>

          <h2 className="text-lg font-bold text-foreground">11. Termination of Account</h2>
          <p>We reserve the right to suspend or terminate accounts for violation of these Terms, fraudulent payment, academic misconduct, or abuse of AI features. Termination may occur without prior notice in serious cases.</p>

          <h2 className="text-lg font-bold text-foreground">12. Changes to Terms</h2>
          <p>We may update these Terms periodically. Continued use of PRAGYANAM AI after updates constitutes acceptance of the revised Terms.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
