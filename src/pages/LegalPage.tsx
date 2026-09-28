import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Award, FileText, Lock } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');
  const isGuidelines = location.pathname.includes('guidelines');

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      
      {/* Tab Switcher */}
      <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 text-xs">
        <Link
          to="/guidelines"
          className={`pb-3 font-semibold border-b-2 -mb-[2px] transition-colors ${
            isGuidelines
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Community Guidelines
        </Link>
        <Link
          to="/terms"
          className={`pb-3 font-semibold border-b-2 -mb-[2px] transition-colors ${
            !isGuidelines && !isPrivacy
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Terms of Service
        </Link>
        <Link
          to="/privacy"
          className={`pb-3 font-semibold border-b-2 -mb-[2px] transition-colors ${
            isPrivacy
              ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Privacy Policy
        </Link>
      </div>

      {isGuidelines && (
        <article className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white font-display">
              OpenAsk Community Guidelines
            </h1>
            <p className="text-neutral-500 text-xs">
              Last updated: September 2026 · Governing principles for civil and constructive inquiry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Core Tenet: Intellectual Curiosity & Civility</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              OpenAsk is dedicated to the mutual pursuit of understanding. We expect all contributors to present well-framed questions and deliver honest, evidence-supported answers.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">1. Formulating Substantive Questions</h2>
            <p>
              Questions should be clear, concise, and focused on genuine learning. Avoid rhetorical baiting, low-effort sensationalism, and repetitive queries. If inquiring on complex topics, provide background context and specify what aspect you are exploring.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">2. Constructive, Verified Answers</h2>
            <p>
              Answers must directly address the question posed. Provide explanations, methodologies, and context rather than single-word opinions. Never plagiarize content or present speculative theories as established fact.
            </p>
          </section>

          <section id="anonymous" className="space-y-3">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-lg font-bold text-neutral-950 dark:text-white">3. Anonymous Inquiries & Privacy Guarantee</h2>
            </div>
            <p>
              OpenAsk permits anonymous posting to empower members to ask vulnerable, stigmatized, or whistleblowing questions without fear of social retaliation. Anonymous content mathematically isolates your identity from public records.
            </p>
            <p>
              However, anonymous status is not an exemption from our standards of safety. Abusive, defamatory, or illegal anonymous content will be removed, and platform ownership records are retained strictly for administrative abuse mitigation.
            </p>
          </section>

          <section id="reputation" className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <h2 className="text-lg font-bold text-neutral-950 dark:text-white">4. Reputation & Voting Integrity</h2>
            </div>
            <p>
              Votes represent community validation of helpfulness and clarity. Vote manipulation, reciprocal vote rings, automated bot voting, and coordinated downvote brigades are strictly prohibited and result in permanent suspension.
            </p>
          </section>

          <section id="reporting" className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">5. Enforcement & Reporting</h2>
            <p>
              Every question, answer, and comment features a built-in reporting mechanism. When reporting, select the appropriate category and provide concise context to facilitate review by our safety system.
            </p>
          </section>
        </article>
      )}

      {!isGuidelines && !isPrivacy && (
        <article className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white font-display">
              Terms of Service
            </h1>
            <p className="text-neutral-500 text-xs">
              Last updated: September 2026 · Legal terms governing usage of the OpenAsk platform.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OpenAsk, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">2. Content Ownership and Licensing</h2>
            <p>
              You retain ownership of the questions, answers, and comments you contribute to OpenAsk. By posting public content, you grant OpenAsk a perpetual, worldwide, non-exclusive, royalty-free license to display, index, distribute, and format your contributions on the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">3. User Conduct and Account Termination</h2>
            <p>
              You agree not to use OpenAsk for illegal purposes, harassment, hate speech, spam dissemination, or intellectual property infringement. OpenAsk reserves the right to suspend or terminate accounts that breach these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">4. Disclaimer of Warranties</h2>
            <p>
              OpenAsk is provided on an "as is" and "as available" basis. Information provided in questions and answers does not constitute professional medical, legal, financial, or engineering advice.
            </p>
          </section>
        </article>
      )}

      {isPrivacy && (
        <article className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white font-display">
              Privacy Policy
            </h1>
            <p className="text-neutral-500 text-xs">
              Last updated: September 2026 · How OpenAsk protects and isolates your personal data.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white text-xs">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Privacy By Design</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              We collect only the bare minimum data necessary to operate the platform securely. We do not sell user data to advertising brokers.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">1. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Email address and profile display details managed securely via Firebase Authentication.</li>
              <li><strong>Public Activity:</strong> Questions, answers, bookmarks, and votes that you explicitly publish publicly.</li>
              <li><strong>Private Records:</strong> Personal notification settings and private anonymous ownership maps stored under strict access control.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">2. Anonymous Posting Architecture</h2>
            <p>
              When you select anonymous posting, your user identifier is never attached to the public question or answer document. A separate, restricted ownership record is generated to prevent unauthorized modifications while keeping your identity private from public queries and search crawlers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white">3. Data Retention and Deletion</h2>
            <p>
              You have the right to request deletion of your account and private personal information at any time via your account settings.
            </p>
          </section>
        </article>
      )}

    </div>
  );
};
