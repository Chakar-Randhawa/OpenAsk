import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        onClose();
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
            <Share2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span>Share Discussion</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed truncate font-medium">
            {title}
          </p>

          <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full bg-transparent px-2 text-neutral-600 dark:text-neutral-300 focus:outline-none truncate font-mono text-[11px]"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 font-medium bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-600 rounded-md hover:bg-neutral-100 transition-colors shrink-0 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2 font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg transition-colors"
            >
              Share via System Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
