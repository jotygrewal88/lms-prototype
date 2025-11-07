"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic,
  List, ListOrdered, Quote, Link as LinkIcon,
  Heading1, Heading2, Heading3, Sparkles
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { createStyleLintsPlugin } from './plugins/styleLints';
import { createGlossaryHintsPlugin } from './plugins/glossaryHints';
import { GlossaryCallout } from './nodes/GlossaryCallout';
import ToneReadabilityMeter from './ToneReadabilityMeter';
import { getOrganization } from '@/lib/store';
import { simplifyText, professionalizeText, clarifyText } from '@/lib/ai/readability';
import { applyQuickAdjust, insertGlossaryCallout, applyInlineStyleFix, addIgnoredLint, setOrgStyleGuide } from '@/lib/store';
import { StyleAuditIssue, IgnoredLint } from '@/types';

interface RichTextEditorProps {
  value: string; // HTML
  onChange: (html: string) => void;
  readOnly?: boolean;
  ariaLabel?: string;
  onFocusChange?: (focused: boolean) => void;
  showAIToolbar?: boolean;
  onAIAction?: (action: 'rewrite' | 'expand' | 'simplify', selection: string) => void;
  // Epic 1G.8: Style linting props
  sectionId?: string;
  lessonId?: string;
  courseId?: string;
  onInlineFix?: (issue: StyleAuditIssue, replacement: string) => void;
  onIgnoreLint?: (ignoredLint: IgnoredLint) => void;
  onAddToStyleGuide?: (term: string, preferred?: string, isBanned?: boolean) => void;
}

export default function RichTextEditor({
  value,
  onChange,
  readOnly = false,
  ariaLabel = "Rich text editor",
  onFocusChange,
  showAIToolbar = false,
  onAIAction,
  sectionId,
  lessonId,
  courseId,
  onInlineFix,
  onIgnoreLint,
  onAddToStyleGuide,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiMenuPosition, setAIMenuPosition] = useState({ top: 0, left: 0 });

  const orgStyleGuide = getOrganization().styleGuide;

  // Build extensions array with plugins
  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline hover:text-indigo-700',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing or use AI to generate content...',
      }),
      // Epic 1G.8: Glossary Callout node
      GlossaryCallout.configure({
        HTMLAttributes: {
          class: 'glossary-callout',
        },
      }),
    ];

    // Epic 1G.8: Add style lints plugin
    if (sectionId && courseId) {
      baseExtensions.push(
        createStyleLintsPlugin({
          sectionId,
          lessonId,
          courseId,
          isReadOnly: readOnly,
          onInlineFix: (issue, replacement) => {
            if (sectionId) {
              applyInlineStyleFix(sectionId, replacement, issue);
              onInlineFix?.(issue, replacement);
            }
          },
          onIgnoreLint: (ignoredLint) => {
            if (sectionId) {
              addIgnoredLint(sectionId, ignoredLint);
              onIgnoreLint?.(ignoredLint);
            }
          },
          onAddToStyleGuide: (term, preferred, isBanned) => {
            if (isBanned) {
              const currentBanned = orgStyleGuide?.bannedTerms || [];
              setOrgStyleGuide({ bannedTerms: [...currentBanned, term] });
            } else if (preferred) {
              const currentPreferred = orgStyleGuide?.preferredTerms || [];
              setOrgStyleGuide({ preferredTerms: [...currentPreferred, { term, preferred }] });
            }
            onAddToStyleGuide?.(term, preferred, isBanned);
          },
        }) as any
      );
    }

    // Epic 1G.8: Add glossary hints plugin
    if (orgStyleGuide) {
      baseExtensions.push(
        createGlossaryHintsPlugin({
          orgStyleGuide,
          onInsertDefinition: (term, definition, position) => {
            if (sectionId) {
              insertGlossaryCallout(sectionId, term, definition, position);
            }
          },
        }) as any
      );
    }

    return baseExtensions;
  }, [sectionId, lessonId, courseId, readOnly, orgStyleGuide, onInlineFix, onIgnoreLint, onAddToStyleGuide]);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration error
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      setIsFocused(true);
      onFocusChange?.(true);
    },
    onBlur: () => {
      setIsFocused(false);
      onFocusChange?.(false);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4',
        'aria-label': ariaLabel,
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Handle text selection for AI menu
  useEffect(() => {
    if (!editor || !showAIToolbar || readOnly) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      
      if (hasSelection) {
        setShowAIMenu(true);
        // Position the menu near the selection
        const coords = editor.view.coordsAtPos(from);
        setAIMenuPosition({
          top: coords.top - 60,
          left: coords.left,
        });
      } else {
        setShowAIMenu(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, showAIToolbar, readOnly]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
      }`}
      title={label}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const handleQuickAdjust = (action: 'simplify' | 'professionalize' | 'clarify') => {
    if (!editor || !sectionId || readOnly) return;
    
    const currentHtml = editor.getHTML();
    let adjustedHtml = '';
    
    switch (action) {
      case 'simplify':
        adjustedHtml = simplifyText(currentHtml);
        break;
      case 'professionalize':
        adjustedHtml = professionalizeText(currentHtml);
        break;
      case 'clarify':
        adjustedHtml = clarifyText(currentHtml);
        break;
    }
    
    if (adjustedHtml && adjustedHtml !== currentHtml) {
      applyQuickAdjust(sectionId, action, adjustedHtml);
      editor.commands.setContent(adjustedHtml);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {!readOnly && (
        <div className={`flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 ${
          isFocused ? 'sticky top-0 z-10' : ''
        }`}>
          <div className="flex items-center gap-1 flex-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              icon={Bold}
              label="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={Italic}
              label="Italic"
            />
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              icon={Heading1}
              label="Heading 1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              icon={Heading2}
              label="Heading 2"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              icon={Heading3}
              label="Heading 3"
            />
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={List}
              label="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={ListOrdered}
              label="Numbered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={Quote}
              label="Quote"
            />
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('Enter URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              isActive={editor.isActive('link')}
              icon={LinkIcon}
              label="Link"
            />
          </div>
          
          {/* Epic 1G.8: Tone & Readability Meter */}
          {orgStyleGuide && (
            <ToneReadabilityMeter
              editor={editor}
              orgStyleGuide={orgStyleGuide}
              isReadOnly={readOnly}
              onQuickAdjust={handleQuickAdjust}
            />
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />

        {/* AI Floating Menu */}
        {showAIMenu && showAIToolbar && !readOnly && (
          <div 
            className="fixed z-50 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1"
            style={{
              top: `${aiMenuPosition.top}px`,
              left: `${aiMenuPosition.left}px`,
            }}
          >
            <button
              onClick={() => {
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                onAIAction?.('rewrite', selectedText);
                setShowAIMenu(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rewrite
            </button>
            <button
              onClick={() => {
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                onAIAction?.('expand', selectedText);
                setShowAIMenu(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Expand
            </button>
            <button
              onClick={() => {
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                onAIAction?.('simplify', selectedText);
                setShowAIMenu(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simplify
            </button>
          </div>
        )}
      </div>

      {readOnly && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700">
          View-only mode
        </div>
      )}
    </div>
  );
}

