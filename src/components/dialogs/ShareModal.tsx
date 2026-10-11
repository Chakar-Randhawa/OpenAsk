import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';
import { copyToClipboard } from '../../core/utils/clipboard';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  targetType?: 'question' | 'answer' | 'profile' | 'discussion';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  targetType = 'discussion',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this ${targetType} on OpenAsk: ${title}`,
          url,
        });
        onClose();
      } catch {
        // User dismissed native share sheet
      }
    }
  };

  const shareText = `Check out this ${targetType} on OpenAsk: "${title}"`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(title);

  const socialChannels = [
    {
      name: 'X (Twitter)',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0a66c2] hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'Reddit',
      shareUrl: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: 'hover:bg-[#ff4500] hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.609a1.24 1.24 0 0 1 1.108-.693zM8.617 10.774c-.908 0-1.646.738-1.646 1.646 0 .909.738 1.646 1.646 1.646.908 0 1.646-.737 1.646-1.646 0-.908-.738-1.646-1.646-1.646zm6.766 0c-.908 0-1.646.738-1.646 1.646 0 .909.738 1.646 1.646 1.646.908 0 1.646-.737 1.646-1.646 0-.908-.738-1.646-1.646-1.646zm-6.84 4.878c-.11 0-.214.043-.292.122a.414.414 0 0 0 0 .585c.87.87 2.19 1.31 3.749 1.31 1.558 0 2.879-.44 3.749-1.31a.414.414 0 0 0 0-.585.414.414 0 0 0-.584 0c-.722.723-1.871 1.1-3.165 1.1-1.294 0-2.443-.377-3.165-1.1a.414.414 0 0 0-.292-.122z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      shareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
      color: 'hover:bg-[#25d366] hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877f2] hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      shareUrl: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this ${targetType} on OpenAsk:\n\n${title}\n\n${url}`)}`,
      color: 'hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-200 dark:hover:text-neutral-900',
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  const modalTitle =
    targetType === 'question'
      ? 'Share Question'
      : targetType === 'answer'
      ? 'Share Answer'
      : targetType === 'profile'
      ? 'Share Profile'
      : 'Share Discussion';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span id="share-modal-title">{modalTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Post Snippet */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
              {targetType}
            </span>
            <p className="text-neutral-900 dark:text-neutral-100 font-medium line-clamp-2 leading-relaxed">
              {title}
            </p>
          </div>

          {/* Deep Link Input & Copy Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              <span>Direct Deep Link</span>
              {copied && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" /> Copied to clipboard!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-transparent px-2 text-neutral-700 dark:text-neutral-300 focus:outline-none truncate font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer text-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media Sharing Options */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
              Share to Social Media & Community
            </span>

            <div className="grid grid-cols-3 gap-2">
              {socialChannels.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 flex flex-col items-center justify-center gap-1.5 text-neutral-700 dark:text-neutral-300 transition-all ${channel.color} group cursor-pointer shadow-2xs`}
                >
                  <span className="transition-transform group-hover:scale-110">
                    {channel.icon}
                  </span>
                  <span className="text-[11px] font-medium truncate max-w-full">
                    {channel.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* System Share (Native Share Sheet if mobile/supported) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-neutral-500" />
              <span>More Sharing Options (System Menu)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
