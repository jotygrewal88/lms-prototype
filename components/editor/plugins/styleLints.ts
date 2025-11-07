// Epic 1G.8: TipTap Style Lints Plugin (Decoration-based)
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Mapping } from '@tiptap/pm/transform';
import { Editor } from '@tiptap/react';
import { auditStyleConsistency } from '@/lib/ai/metadata';
import { getOrganization } from '@/lib/store';
import { StyleAuditIssue, IgnoredLint } from '@/types';

export interface StyleLintsPluginOptions {
  sectionId?: string;
  lessonId?: string;
  courseId?: string;
  isReadOnly?: boolean;
  onInlineFix?: (issue: StyleAuditIssue, replacement: string, sectionId: string) => void;
  onIgnoreLint?: (ignoredLint: IgnoredLint, sectionId: string) => void;
  onAddToStyleGuide?: (term: string, preferred?: string, isBanned?: boolean) => void;
}

const STYLE_LINTS_PLUGIN_KEY = new PluginKey('styleLints');

// Debounce helper
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Simple hash for text content (for ignored lint tracking)
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Get decoration class based on issue kind
function getDecorationClass(kind: StyleAuditIssue['kind']): string {
  switch (kind) {
    case 'bannedTerm':
      return 'style-lint-banned';
    case 'preferredTerm':
      return 'style-lint-preferred';
    case 'readingLevel':
      return 'style-lint-reading';
    case 'tone':
      return 'style-lint-tone';
    default:
      return 'style-lint';
  }
}

// Create style lints plugin
export function createStyleLintsPlugin(options: StyleLintsPluginOptions) {
  let ignoredLints: IgnoredLint[] = [];
  let currentIssues: Array<StyleAuditIssue & { from: number; to: number }> = [];
  let tooltipElement: HTMLElement | null = null;
  let popoverElement: HTMLElement | null = null;
  let hoveredIssue: (StyleAuditIssue & { from: number; to: number }) | null = null;

  // Load ignored lints from resource metadata (mock for now - would need to fetch from store)
  const loadIgnoredLints = () => {
    // This would be loaded from Resource.metadata.ignoredLints via store
    // For now, initialize empty
    ignoredLints = [];
  };

  loadIgnoredLints();

  // Scan content for style issues
  const scanForIssues = async (editor: Editor) => {
    if (!options.courseId) return;

    const html = editor.getHTML();
    const orgStyle = getOrganization().styleGuide;
    
    if (!orgStyle) return;

    try {
      const issues = await auditStyleConsistency({
        courseId: options.courseId,
        scope: 'section',
        sourceHtml: html,
        orgStyle,
      });

      // Map issues to document positions
      const doc = editor.state.doc;
      const textContent = doc.textContent.toLowerCase();
      const issuesWithPositions: Array<StyleAuditIssue & { from: number; to: number }> = [];

      issues.forEach(issue => {
        // Only process issues for this section
        if (issue.location?.sectionId && issue.location.sectionId !== options.sectionId) {
          return;
        }

        let searchText = '';
        let replacement = '';
        
        if (issue.kind === 'bannedTerm') {
          // Find banned term in message
          const match = issue.message.match(/Banned term "([^"]+)"/);
          if (match) {
            searchText = match[1].toLowerCase();
          }
        } else if (issue.kind === 'preferredTerm') {
          // Extract term and preferred from message
          const match = issue.message.match(/Use preferred term "([^"]+)" instead of "([^"]+)"/);
          if (match) {
            replacement = match[1];
            searchText = match[2].toLowerCase();
          }
        }

        if (searchText) {
          // Find position in document
          let found = false;
          let searchIndex = 0;
          
          while (!found && searchIndex < textContent.length) {
            const index = textContent.indexOf(searchText, searchIndex);
            if (index === -1) break;
            
            // Map to document position
            const from = doc.resolve(index).pos;
            const to = doc.resolve(index + searchText.length).pos;
            
            // Check if this range is ignored
            const textHash = hashText(doc.textBetween(from, to));
            const isIgnored = ignoredLints.some(
              lint => lint.from === from && lint.to === to && lint.textHash === textHash
            );
            
            if (!isIgnored) {
              issuesWithPositions.push({
                ...issue,
                from,
                to,
                suggestion: issue.suggestion || replacement,
              });
              found = true;
            }
            
            searchIndex = index + 1;
          }
        }
      });

      currentIssues = issuesWithPositions;
    } catch (error) {
      console.error('Style lint scan failed:', error);
    }
  };

  // Debounced scan
  const debouncedScan = debounce(scanForIssues, 500);

  return new Plugin({
    key: STYLE_LINTS_PLUGIN_KEY,
    
    state: {
      init() {
        return DecorationSet.empty;
      },
      
      apply(tr, set, oldState, newState) {
        // Remap decorations through transaction
        set = set.map(tr.mapping, tr.doc);
        
        // Remap ignored lints through transaction
        if (tr.docChanged) {
          const mapping = tr.mapping;
          ignoredLints = ignoredLints.map(lint => {
            const newFrom = mapping.map(lint.from, -1);
            const newTo = mapping.map(lint.to, 1);
            return {
              ...lint,
              from: newFrom,
              to: newTo,
            };
          }).filter(lint => lint.from < lint.to); // Remove invalid ranges
        }
        
        // Trigger scan on content change
        if (tr.docChanged) {
          const editor = tr.getMeta('editor') as Editor | undefined;
          if (editor) {
            debouncedScan(editor);
          }
        }
        
        // Create decorations from current issues
        const decorations: Decoration[] = [];
        
        currentIssues.forEach(issue => {
          // Check if ignored
          const textHash = hashText(newState.doc.textBetween(issue.from, issue.to));
          const isIgnored = ignoredLints.some(
            lint => lint.from === issue.from && lint.to === issue.to && lint.textHash === textHash
          );
          
          if (!isIgnored && issue.from < issue.to && issue.from >= 0 && issue.to <= newState.doc.content.size) {
            decorations.push(
              Decoration.inline(issue.from, issue.to, {
                class: getDecorationClass(issue.kind),
                'data-issue-kind': issue.kind,
                'data-issue-message': issue.message,
                'data-issue-suggestion': issue.suggestion || '',
              })
            );
          }
        });
        
        return DecorationSet.create(newState.doc, decorations);
      },
    },
    
    props: {
      decorations(state) {
        return this.getState(state);
      },
      
      handleDOMEvents: {
        mouseover(view, event) {
          const target = event.target as HTMLElement;
          if (target.classList.contains('style-lint-banned') ||
              target.classList.contains('style-lint-preferred') ||
              target.classList.contains('style-lint-reading') ||
              target.classList.contains('style-lint-tone')) {
            
            // Find the issue for this decoration
            const decorations = this.getState(view.state) as DecorationSet;
            const pos = view.posAtDOM(target, 0);
            
            // Find decorations at this position
            const foundDecorations = decorations.find(pos, pos);
            if (foundDecorations.length > 0) {
              const decoration = foundDecorations[0];
              const issue = currentIssues.find(i => {
                const dec = decorations.find(i.from, i.to);
                return dec.length > 0 && dec[0] === decoration;
              });
              hoveredIssue = issue || null;
              if (hoveredIssue) {
                showTooltip(target, hoveredIssue);
              }
            }
            
            return true;
          }
          return false;
        },
        
        mouseout(view, event) {
          const target = event.target as HTMLElement;
          if (target.classList.contains('style-lint-banned') ||
              target.classList.contains('style-lint-preferred') ||
              target.classList.contains('style-lint-reading') ||
              target.classList.contains('style-lint-tone')) {
            hideTooltip();
            hoveredIssue = null;
            return true;
          }
          return false;
        },
        
        click(view, event) {
          const target = event.target as HTMLElement;
          if (target.classList.contains('style-lint-banned') ||
              target.classList.contains('style-lint-preferred') ||
              target.classList.contains('style-lint-reading') ||
              target.classList.contains('style-lint-tone')) {
            
            if (options.isReadOnly) {
              // Show read-only tooltip
              showTooltip(target, hoveredIssue || currentIssues[0], true);
              return true;
            }
            
            const decorations = this.getState(view.state) as DecorationSet;
            const pos = view.posAtDOM(target, 0);
            
            // Find matching issue by position
            const foundDecorations = decorations.find(pos, pos);
            if (foundDecorations.length > 0) {
              const decoration = foundDecorations[0];
              const issue = currentIssues.find(i => {
                const dec = decorations.find(i.from, i.to);
                return dec.length > 0 && dec[0] === decoration;
              });
              
              if (issue) {
                showPopover(target, issue, view);
              }
            }
            
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          return false;
        },
      },
    },
  });

  // Show tooltip
  function showTooltip(element: HTMLElement, issue: (StyleAuditIssue & { from: number; to: number }) | null, readOnly = false) {
    if (!issue) return;
    
    hideTooltip();
    
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'style-lint-tooltip';
    tooltipElement.innerHTML = `
      <div class="text-sm font-medium text-gray-900 mb-1">${issue.message}</div>
      ${issue.suggestion ? `<div class="text-xs text-gray-600">Suggestion: ${issue.suggestion}</div>` : ''}
      ${readOnly ? '<div class="text-xs text-amber-600 mt-1">Read-only mode</div>' : ''}
    `;
    
    const rect = element.getBoundingClientRect();
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.top = `${rect.bottom + 5}px`;
    tooltipElement.style.left = `${rect.left}px`;
    tooltipElement.style.zIndex = '10000';
    tooltipElement.style.backgroundColor = 'white';
    tooltipElement.style.border = '1px solid #e5e7eb';
    tooltipElement.style.borderRadius = '0.375rem';
    tooltipElement.style.padding = '0.5rem';
    tooltipElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    tooltipElement.style.maxWidth = '300px';
    
    document.body.appendChild(tooltipElement);
  }

  // Hide tooltip
  function hideTooltip() {
    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }
  }

  // Show popover with actions
  function showPopover(element: HTMLElement, issue: StyleAuditIssue & { from: number; to: number }, view: any) {
    hidePopover();
    
    popoverElement = document.createElement('div');
    popoverElement.className = 'style-lint-popover';
    
    const issueTerm = issue.kind === 'bannedTerm' 
      ? issue.message.match(/Banned term "([^"]+)"/)?.[1] || ''
      : issue.kind === 'preferredTerm'
      ? issue.message.match(/instead of "([^"]+)"/)?.[1] || ''
      : '';
    
    popoverElement.innerHTML = `
      <div class="p-3 border-b border-gray-200">
        <div class="text-sm font-medium text-gray-900 mb-1">${issue.message}</div>
        ${issue.suggestion ? `<div class="text-xs text-gray-600">${issue.suggestion}</div>` : ''}
      </div>
      <div class="p-2">
        ${issue.suggestion ? `
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors mb-1" data-action="replace">
            Replace with "${issue.suggestion}"
          </button>
        ` : ''}
        <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors mb-1" data-action="ignore">
          Ignore once
        </button>
        ${issueTerm ? `
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors mb-1" data-action="add-banned">
            Add "${issueTerm}" to banned terms
          </button>
          ${issue.kind === 'preferredTerm' ? `
            <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors" data-action="add-preferred">
              Add preferred term mapping
            </button>
          ` : ''}
        ` : ''}
      </div>
    `;
    
    const rect = element.getBoundingClientRect();
    popoverElement.style.position = 'fixed';
    popoverElement.style.top = `${rect.bottom + 5}px`;
    popoverElement.style.left = `${rect.left}px`;
    popoverElement.style.zIndex = '10001';
    popoverElement.style.backgroundColor = 'white';
    popoverElement.style.border = '1px solid #e5e7eb';
    popoverElement.style.borderRadius = '0.375rem';
    popoverElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    popoverElement.style.minWidth = '250px';
    
    // Handle button clicks
    popoverElement.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.closest('[data-action]')?.getAttribute('data-action');
      
      if (action === 'replace' && issue.suggestion && options.sectionId) {
        // Replace text
        const editor = view.editor as Editor;
        const tr = editor.state.tr;
        tr.replaceWith(issue.from, issue.to, editor.schema.text(issue.suggestion));
        editor.view.dispatch(tr);
        
        // Call callback
        options.onInlineFix?.(issue, issue.suggestion, options.sectionId);
        
        hidePopover();
      } else if (action === 'ignore' && options.sectionId) {
        // Ignore this lint
        const textHash = hashText(view.state.doc.textBetween(issue.from, issue.to));
        const ignoredLint: IgnoredLint = {
          kind: issue.kind,
          from: issue.from,
          to: issue.to,
          textHash,
        };
        
        ignoredLints.push(ignoredLint);
        options.onIgnoreLint?.(ignoredLint, options.sectionId);
        
        // Update decorations
        const tr = view.state.tr;
        tr.setMeta('refreshDecorations', true);
        view.dispatch(tr);
        
        hidePopover();
      } else if (action === 'add-banned' && issueTerm) {
        options.onAddToStyleGuide?.(issueTerm, undefined, true);
        hidePopover();
      } else if (action === 'add-preferred' && issueTerm && issue.suggestion) {
        options.onAddToStyleGuide?.(issueTerm, issue.suggestion, false);
        hidePopover();
      }
    });
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', closePopoverOnOutsideClick, true);
    }, 0);
    
    document.body.appendChild(popoverElement);
  }

  function closePopoverOnOutsideClick(e: MouseEvent) {
    if (popoverElement && !popoverElement.contains(e.target as Node)) {
      hidePopover();
      document.removeEventListener('click', closePopoverOnOutsideClick, true);
    }
  }

  function hidePopover() {
    if (popoverElement) {
      popoverElement.remove();
      popoverElement = null;
    }
    document.removeEventListener('click', closePopoverOnOutsideClick, true);
  }
}

