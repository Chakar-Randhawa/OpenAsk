import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { reportService } from '../../core/services/reportService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'question' | 'answer' | 'user' | 'comment';
  targetId: string;
}

const REPORT_REASONS = [
  'Spam or misleading advertising',
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Violence or physical threat',
  'Sexual or explicit content',
  'Misinformation or harmful advice',
  'Copyright or intellectual property violation',
  'Other violation of community guidelines'
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId
}) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reportService.submitReport(
        currentUser.uid,
        targetType,
        targetId,
        reason,
        details
      );
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Report Content</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Report Submitted</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Thank you for keeping OpenAsk safe and civil. Our moderation architecture will review this report against our community guidelines.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Violation Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide relevant context to assist our review..."
                rows={3}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
