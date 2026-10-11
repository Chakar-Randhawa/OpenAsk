import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  Heading,
  Link2,
  Eye,
  PenLine,
  HelpCircle
} from 'lucide-react';
import { FormattedContent } from './FormattedContent';

export interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write here...',
  minRows = 5,
  required = false,
  minLength,
  maxLength = 15000,
  disabled = false,
  id,
  className = '',
  ariaLabel = 'Rich text editor'
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert formatting around selected text or at cursor
  const insertFormatting = useCallback(
    (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);

      const contentToWrap = selected || defaultPlaceholder;
      const replacement = `${prefix}${contentToWrap}${suffix}`;

      const newValue = value.substring(0, start) + replacement + value.substring(end);
      onChange(newValue);

      // Restore cursor position in next tick
      setTimeout(() => {
        textarea.focus();
        if (selected) {
          textarea.setSelectionRange(start, start + replacement.length);
        } else {
          // Highlight the placeholder text
          textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
        }
      }, 0);
    },
    [value, onChange]
  );

  // Insertion handlers
  const handleBold = () => insertFormatting('**', '**', 'bold text');
  const handleItalic = () => insertFormatting('*', '*', 'italic text');
  const handleInlineCode = () => insertFormatting('`', '`', 'code');
  const handleCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const prefix = '\n```typescript\n';
    const suffix = '\n```\n';
    const codePlaceholder = selected || '// write or paste code here';
    const replacement = `${prefix}${codePlaceholder}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + codePlaceholder.length
      );
    }, 0);
  };
  const handleQuote = () => insertFormatting('\n> ', '', 'quote');
  const handleBulletList = () => insertFormatting('\n- ', '', 'list item');
  const handleNumberedList = () => insertFormatting('\n1. ', '', 'first item');
  const handleHeading = () => insertFormatting('\n### ', '', 'Heading');
  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    if (selected) {
      insertFormatting('[', '](https://example.com)');
    } else {
      insertFormatting('[link text](', ')', 'https://example.com');
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifier = isMac ? e.metaKey : e.ctrlKey;

    if (isModifier) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleBold();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        handleItalic();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleLink();
      }
    }
  };

  return (
    <div
      className={`border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-xs transition-colors focus-within:border-neutral-400 dark:focus-within:border-neutral-500 ${className}`}
    >
      {/* Editor Header: Formatting Toolbar & Write/Preview Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-750 text-xs">
        
        {/* Formatting Action Buttons (Visible in Write Mode) */}
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            onClick={handleBold}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
            aria-label="Format bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleItalic}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
            aria-label="Format italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={handleCodeBlock}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
            title="Code Block"
            aria-label="Insert code block"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">Block</span>
          </button>

          <button
            type="button"
            onClick={handleInlineCode}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Inline Code (`code`)"
            aria-label="Format inline code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={handleHeading}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Heading (### title)"
            aria-label="Insert heading"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleQuote}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Blockquote (> quote)"
            aria-label="Insert quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleBulletList}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Bullet list (- item)"
            aria-label="Insert bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNumberedList}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Numbered list (1. item)"
            aria-label="Insert numbered list"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleLink}
            disabled={disabled || activeTab === 'preview'}
            className="p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer"
            title="Insert Link (Ctrl+K)"
            aria-label="Insert link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Toggle Tabs: Write vs Preview */}
        <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-lg ml-auto">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'write'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PenLine className="w-3 h-3" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

      </div>

      {/* Editor Body Area */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={minRows}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          aria-label={ariaLabel}
          className="w-full p-3 sm:p-3.5 text-xs sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-y leading-relaxed font-sans"
        />
      ) : (
        <div className="p-3 sm:p-4 min-h-[140px] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50/40 dark:bg-neutral-900/60 overflow-y-auto">
          {value.trim() ? (
            <FormattedContent content={value} />
          ) : (
            <p className="text-xs text-neutral-400 italic">
              Nothing to preview. Switch to the Write tab to draft your content.
            </p>
          )}
        </div>
      )}

      {/* Editor Footer: Character Count & Formatting Tips */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 dark:bg-neutral-850/60 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 select-none">
        <button
          type="button"
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3 h-3 text-neutral-400" />
          <span>Formatting guide</span>
        </button>

        <div className="flex items-center gap-2 tabular-nums">
          {minLength && value.length < minLength && (
            <span className="text-amber-600 dark:text-amber-400">
              Min {minLength} characters ({minLength - value.length} remaining)
            </span>
          )}
          <span>
            {value.length} {maxLength ? `/ ${maxLength}` : 'chars'}
          </span>
        </div>
      </div>

      {/* Collapsible Quick Cheatsheet */}
      {showCheatsheet && (
        <div className="px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border-t border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <strong className="text-neutral-900 dark:text-white font-mono">**bold**</strong>
            <p className="text-neutral-400 text-[10px]">Bold text</p>
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white font-mono">*italic*</strong>
            <p className="text-neutral-400 text-[10px]">Italic text</p>
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white font-mono">```lang ... ```</strong>
            <p className="text-neutral-400 text-[10px]">Code block</p>
          </div>
          <div>
            <strong className="text-neutral-900 dark:text-white font-mono">`code`</strong>
            <p className="text-neutral-400 text-[10px]">Inline code</p>
          </div>
        </div>
      )}
    </div>
  );
};
