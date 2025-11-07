// Epic 1G.8: Glossary Hints Plugin (hover tooltips for glossary terms)
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { OrgStyleGuide } from '@/types';

export interface GlossaryHintsPluginOptions {
  orgStyleGuide?: OrgStyleGuide;
  onInsertDefinition?: (term: string, definition: string, position: number) => void;
}

const GLOSSARY_HINTS_PLUGIN_KEY = new PluginKey('glossaryHints');

export function createGlossaryHintsPlugin(options: GlossaryHintsPluginOptions) {
  let tooltipElement: HTMLElement | null = null;
  let hoveredTerm: { term: string; definition: string; from: number; to: number } | null = null;

  // Find glossary terms in text
  const findGlossaryTerms = (doc: any): Array<{ term: string; definition: string; from: number; to: number }> => {
    const terms: Array<{ term: string; definition: string; from: number; to: number }> = [];
    
    if (!options.orgStyleGuide?.glossary || options.orgStyleGuide.glossary.length === 0) {
      return terms;
    }

    const textContent = doc.textContent.toLowerCase();
    
    options.orgStyleGuide.glossary.forEach(({ term, definition }) => {
      const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'gi');
      let searchIndex = 0;
      
      while (true) {
        const index = textContent.indexOf(term.toLowerCase(), searchIndex);
        if (index === -1) break;
        
        // Map to document position
        const from = doc.resolve(Math.min(index, doc.content.size)).pos;
        const to = doc.resolve(Math.min(index + term.length, doc.content.size)).pos;
        
        terms.push({ term, definition, from, to });
        searchIndex = index + 1;
      }
    });

    return terms;
  };

  return new Plugin({
    key: GLOSSARY_HINTS_PLUGIN_KEY,
    
    state: {
      init() {
        return DecorationSet.empty;
      },
      
      apply(tr, set, oldState, newState) {
        // Remap decorations through transaction
        set = set.map(tr.mapping, tr.doc);
        
        // Create decorations for glossary terms
        const terms = findGlossaryTerms(newState.doc);
        const decorations: Decoration[] = [];
        
        terms.forEach(({ term, definition, from, to }) => {
          if (from < to && from >= 0 && to <= newState.doc.content.size) {
            decorations.push(
              Decoration.inline(from, to, {
                class: 'glossary-term',
                'data-term': term,
                'data-definition': definition,
                style: 'cursor: help;',
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
          if (target.classList.contains('glossary-term')) {
            const term = target.getAttribute('data-term');
            const definition = target.getAttribute('data-definition');
            
            if (term && definition) {
              const decorations = this.getState(view.state) as DecorationSet;
              const pos = view.posAtDOM(target, 0);
              
              // Find matching term
              const foundDecorations = decorations.find(pos, pos);
              if (foundDecorations.length > 0) {
                const decoration = foundDecorations[0];
                const decFrom = decoration.from;
                const decTo = decoration.to;
                
                hoveredTerm = { term, definition, from: decFrom, to: decTo };
                showTooltip(target, term, definition);
              }
            }
            
            return true;
          }
          return false;
        },
        
        mouseout(view, event) {
          const target = event.target as HTMLElement;
          if (target.classList.contains('glossary-term')) {
            hideTooltip();
            hoveredTerm = null;
            return true;
          }
          return false;
        },
        
        click(view, event) {
          const target = event.target as HTMLElement;
          if (target.classList.contains('glossary-term')) {
            if (hoveredTerm && options.onInsertDefinition) {
              // Insert definition callout after the paragraph containing the term
              const $pos = view.state.doc.resolve(hoveredTerm.to);
              const paragraphEnd = $pos.end($pos.depth);
              
              options.onInsertDefinition(
                hoveredTerm.term,
                hoveredTerm.definition,
                paragraphEnd
              );
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
  function showTooltip(element: HTMLElement, term: string, definition: string) {
    hideTooltip();
    
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'glossary-tooltip';
    tooltipElement.innerHTML = `
      <div class="text-sm font-semibold text-gray-900 mb-1">${term}</div>
      <div class="text-xs text-gray-600">${definition}</div>
      <div class="text-xs text-indigo-600 mt-2 font-medium">Click to insert definition</div>
    `;
    
    const rect = element.getBoundingClientRect();
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.top = `${rect.bottom + 5}px`;
    tooltipElement.style.left = `${rect.left}px`;
    tooltipElement.style.zIndex = '10000';
    tooltipElement.style.backgroundColor = 'white';
    tooltipElement.style.border = '1px solid #e5e7eb';
    tooltipElement.style.borderRadius = '0.375rem';
    tooltipElement.style.padding = '0.75rem';
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
}




