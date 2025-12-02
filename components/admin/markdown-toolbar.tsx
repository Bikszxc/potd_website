'use client';

import { Bold, Italic, List, Link, Heading2, Quote, Code, Image } from 'lucide-react';
import { RefObject } from 'react';

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onImageClick?: () => void;
}

export default function MarkdownToolbar({ textareaRef, value, onChange, onImageClick }: MarkdownToolbarProps) {
  const insertFormat = (startTag: string, endTag = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newValue = before + startTag + selection + endTag + after;
    
    onChange(newValue);

    // Restore focus and selection (optional adjustment for cursor placement)
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + startTag.length + selection.length + endTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 bg-[#0f1016] border border-white/10 p-1 rounded-t-sm border-b-0">
      <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Bold">
        <Bold size={14} />
      </button>
      <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Italic">
        <Italic size={14} />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1"></div>
      <button type="button" onClick={() => insertFormat('## ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Heading">
        <Heading2 size={14} />
      </button>
      <button type="button" onClick={() => insertFormat('- ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="List">
        <List size={14} />
      </button>
      <button type="button" onClick={() => insertFormat('> ')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Quote">
        <Quote size={14} />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1"></div>
      <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Link">
        <Link size={14} />
      </button>
      <button 
        type="button" 
        onClick={() => {
          if (onImageClick) {
            onImageClick();
          } else {
            insertFormat('![alt text](', ')');
          }
        }} 
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" 
        title="Image"
      >
        <Image size={14} />
      </button>
      <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Code Block">
        <Code size={14} />
      </button>
    </div>
  );
}
