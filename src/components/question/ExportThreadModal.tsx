import React, { useState } from 'react';
import { X, Download, Copy, Check, Printer, FileText, Sparkles } from 'lucide-react';
import { Question, Answer } from '../../core/models/types';
import { copyToClipboard } from '../../core/utils/clipboard';

interface ExportThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  answers: Answer[];
}

export const ExportThreadModal: React.FC<ExportThreadModalProps> = ({
  isOpen,
  onClose,
  question,
  answers
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate canonical Markdown representation
  const generateMarkdown = (): string => {
    const acceptedAnswer = answers.find(
      (a) => a.answerId === question.acceptedAnswerId || a.isAccepted
    );
    const otherAnswers = answers.filter((a) => a !== acceptedAnswer);

    let md = `# ${question.title}\n\n`;
    md += `**Category:** ${question.categoryName}  \n`;
    md += `**Author:** ${question.isAnonymous ? 'Anonymous' : question.authorDisplayName || 'Community Member'}  \n`;
    md += `**Asked:** ${new Date(question.createdAt).toLocaleDateString()}  \n`;
    md += `**Status:** ${question.acceptedAnswerId || question.isSolved ? '✅ Solved' : 'Open'}  \n`;
    if (question.tagIds && question.tagIds.length > 0) {
      md += `**Tags:** ${question.tagIds.map((t) => `#${t}`).join(', ')}  \n`;
    }
    md += `\n---\n\n`;
    md += `## Question Details\n\n${question.body}\n\n`;

    if (acceptedAnswer) {
      md += `---\n\n## ⭐ Accepted Solution (Verified by Author)\n\n`;
      md += `**By:** ${acceptedAnswer.isAnonymous ? 'Anonymous' : acceptedAnswer.authorDisplayName || 'Community Member'} | **Votes:** ${acceptedAnswer.voteCount}  \n\n`;
      md += `${acceptedAnswer.body}\n\n`;
    }

    if (otherAnswers.length > 0) {
      md += `---\n\n## Community Answers (${otherAnswers.length})\n\n`;
      otherAnswers.forEach((ans, idx) => {
        md += `### Answer #${idx + 1} by ${ans.isAnonymous ? 'Anonymous' : ans.authorDisplayName || 'Community Member'} (Score: ${ans.voteCount})\n\n`;
        md += `${ans.body}\n\n`;
      });
    }

    md += `\n---\n*Exported from OpenAsk Knowledge Community on ${new Date().toLocaleDateString()}*\n`;
    return md;
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown();
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = question.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    link.href = url;
    link.setAttribute('download', `${safeTitle}_study_guide.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const markdownContent = generateMarkdown();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
            <FileText className="w-4 h-4 text-blue-500" />
            <span id="export-modal-title">Export Discussion & Study Guide</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Export this entire question thread—including the author's inquiry, verified solution, and peer contributions—formatted for local note-taking (Obsidian, Notion), study guides, or documentation.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
            >
              <Download className="w-5 h-5 text-blue-500 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Download .MD</span>
              <span className="text-[10px] text-neutral-500">Raw markdown file</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500 animate-scale-up" />
              ) : (
                <Copy className="w-5 h-5 text-emerald-500 transition-transform group-hover:scale-110" />
              )}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {copied ? 'Copied!' : 'Copy Markdown'}
              </span>
              <span className="text-[10px] text-neutral-500">Paste anywhere</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
            >
              <Printer className="w-5 h-5 text-purple-500 transition-transform group-hover:scale-110" />
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Print / PDF</span>
              <span className="text-[10px] text-neutral-500">Browser print view</span>
            </button>
          </div>

          {/* Markdown Preview Box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              Formatted Preview
            </span>
            <pre className="p-3 bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {markdownContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
