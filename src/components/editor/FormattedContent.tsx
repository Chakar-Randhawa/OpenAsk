import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { copyToClipboard } from '../../core/utils/clipboard';

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into blocks: code blocks vs text blocks
  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed break-words ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.content} language={block.language} />;
        }
        if (block.type === 'quote') {
          return (
            <blockquote
              key={idx}
              className="border-l-3 border-neutral-400 dark:border-neutral-600 pl-3.5 my-2 py-0.5 italic text-neutral-600 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-r-lg"
            >
              {renderInlineFormatted(block.content)}
            </blockquote>
          );
        }
        if (block.type === 'heading') {
          return (
            <h4
              key={idx}
              className="font-bold text-neutral-950 dark:text-white pt-2 text-base font-display"
            >
              {renderInlineFormatted(block.content)}
            </h4>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 my-1 pl-1 text-neutral-800 dark:text-neutral-200">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-snug">
                  {renderInlineFormatted(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ordered-list') {
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1 my-1 pl-1 text-neutral-800 dark:text-neutral-200">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-snug">
                  {renderInlineFormatted(item)}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-line text-neutral-800 dark:text-neutral-200">
            {renderInlineFormatted(block.content)}
          </p>
        );
      })}
    </div>
  );
};

interface Block {
  type: 'paragraph' | 'code' | 'quote' | 'heading' | 'list' | 'ordered-list';
  content: string;
  language?: string;
  items: string[];
}

function parseBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  const lines = raw.split(/\r?\n/);
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let currentList: string[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({
        type: isOrderedList ? 'ordered-list' : 'list',
        content: '',
        items: [...currentList]
      });
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for fenced code block toggle
    const codeMatch = line.match(/^```(\w+)?/);
    if (codeMatch) {
      flushList();
      if (!inCode) {
        inCode = true;
        codeLang = codeMatch[1] || '';
        codeBuffer = [];
      } else {
        inCode = false;
        blocks.push({
          type: 'code',
          content: codeBuffer.join('\n'),
          language: codeLang,
          items: []
        });
        codeBuffer = [];
        codeLang = '';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // List item (unordered)
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (isOrderedList) flushList();
      isOrderedList = false;
      currentList.push(bulletMatch[1]);
      continue;
    }

    // List item (ordered)
    const numMatch = line.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      if (!isOrderedList && currentList.length > 0) flushList();
      isOrderedList = true;
      currentList.push(numMatch[1]);
      continue;
    }

    flushList();

    // Blockquote
    if (line.startsWith('>')) {
      blocks.push({
        type: 'quote',
        content: line.replace(/^>\s?/, ''),
        items: []
      });
      continue;
    }

    // Heading
    if (line.match(/^#{1,4}\s+(.+)/)) {
      blocks.push({
        type: 'heading',
        content: line.replace(/^#{1,4}\s+/, ''),
        items: []
      });
      continue;
    }

    // Normal text lines
    if (line.trim().length === 0) {
      // Empty line
      continue;
    }

    blocks.push({
      type: 'paragraph',
      content: line,
      items: []
    });
  }

  flushList();

  if (inCode && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      content: codeBuffer.join('\n'),
      language: codeLang,
      items: []
    });
  }

  return blocks;
}

/**
 * Safe inline parser for bold, italics, inline code, and links.
 * Returns an array of ReactNodes without dangerouslySetInnerHTML.
 */
function renderInlineFormatted(text: string): React.ReactNode[] {
  if (!text) return [];

  const elements: React.ReactNode[] = [];
  // Tokenizer pattern: code, links, bold, italics
  const regex = /(`[^`]+`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(__([^_]+)__)|(_([^_]+)_)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const [fullMatch] = match;

    if (fullMatch.startsWith('`') && fullMatch.endsWith('`')) {
      // Inline code
      const codeContent = fullMatch.slice(1, -1);
      elements.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400 font-mono text-[0.875em] border border-neutral-200 dark:border-neutral-700/60"
        >
          {codeContent}
        </code>
      );
    } else if (
      (fullMatch.startsWith('**') && fullMatch.endsWith('**')) ||
      (fullMatch.startsWith('__') && fullMatch.endsWith('__'))
    ) {
      // Bold
      const boldText = fullMatch.slice(2, -2);
      elements.push(
        <strong key={`bold-${match.index}`} className="font-bold text-neutral-950 dark:text-white">
          {boldText}
        </strong>
      );
    } else if (
      (fullMatch.startsWith('*') && fullMatch.endsWith('*')) ||
      (fullMatch.startsWith('_') && fullMatch.endsWith('_'))
    ) {
      // Italic
      const italicText = fullMatch.slice(1, -1);
      elements.push(
        <em key={`italic-${match.index}`} className="italic">
          {italicText}
        </em>
      );
    } else if (fullMatch.startsWith('[') && fullMatch.includes('](')) {
      // Link: [linkText](linkUrl)
      const linkText = match[11];
      const linkUrl = match[12];
      elements.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
        >
          {linkText}
        </a>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-100 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-950 border-b border-neutral-800 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <span>{language || 'code'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer text-[10px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed selection:bg-neutral-700">
        <pre className="m-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
