// Epic 1G.8: Glossary Callout Node Extension (TipTap custom node)
import { Node, mergeAttributes } from '@tiptap/core';

export interface GlossaryCalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    glossaryCallout: {
      /**
       * Insert a glossary callout
       */
      insertGlossaryCallout: (options: { term: string; definition: string }) => ReturnType;
    };
  }
}

export const GlossaryCallout = Node.create<GlossaryCalloutOptions>({
  name: 'glossaryCallout',
  
  group: 'block',
  
  content: 'paragraph+',
  
  draggable: false,
  
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="glossary-callout"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes, node }) {
    const term = node.attrs.term || '';
    const definition = node.attrs.definition || '';
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'glossary-callout',
        class: 'glossary-callout',
      }),
      [
        'div',
        { class: 'glossary-callout-header' },
        [
          'span',
          { class: 'glossary-callout-term' },
          term,
        ],
      ],
      [
        'div',
        { class: 'glossary-callout-body' },
        [
          'div',
          { class: 'glossary-callout-definition' },
          definition,
        ],
        [
          'div',
          { class: 'glossary-callout-content' },
          0, // Content slot
        ],
      ],
    ];
  },
  
  addAttributes() {
    return {
      term: {
        default: '',
        parseHTML: element => element.getAttribute('data-term') || '',
        renderHTML: attributes => {
          if (!attributes.term) {
            return {};
          }
          return {
            'data-term': attributes.term,
          };
        },
      },
      definition: {
        default: '',
        parseHTML: element => element.getAttribute('data-definition') || '',
        renderHTML: attributes => {
          if (!attributes.definition) {
            return {};
          }
          return {
            'data-definition': attributes.definition,
          };
        },
      },
    };
  },
  
  addCommands() {
    return {
      insertGlossaryCallout: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            term: options.term,
            definition: options.definition,
          },
          content: [
            {
              type: 'paragraph',
            },
          ],
        });
      },
    };
  },
});




