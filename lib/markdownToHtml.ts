/**
 * Simple Markdown to HTML converter for AI-generated content
 * Handles common markdown patterns used in course content
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;

  // Preserve <details>/<summary> HTML tags before escaping
  const detailsPlaceholders: string[] = [];
  html = html.replace(/<(\/?)(?:details|summary)(\s[^>]*)?>/gi, (match) => {
    const idx = detailsPlaceholders.length;
    detailsPlaceholders.push(match);
    return `%%DETAILS_${idx}%%`;
  });
  
  // Escape HTML entities first (but preserve our own conversions)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Restore <details>/<summary> tags
  html = html.replace(/%%DETAILS_(\d+)%%/g, (_, idx) => detailsPlaceholders[parseInt(idx)]);
  
  // Split into lines for processing
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      const tag = inOrderedList ? 'ol' : 'ul';
      processedLines.push(`<${tag}>${listItems.map(item => `<li>${item}</li>`).join('')}</${tag}>`);
      listItems = [];
    }
    inList = false;
    inOrderedList = false;
  };
  
  const flushTable = () => {
    if (tableRows.length > 0) {
      let tableHtml = '<table>';
      tableRows.forEach((cells) => {
        tableHtml += '<tr>' + cells.map(c => `<td>${processInlineFormatting(c.trim())}</td>`).join('') + '</tr>';
      });
      tableHtml += '</table>';
      processedLines.push(tableHtml);
      tableRows = [];
    }
    inTable = false;
  };
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Headers (must come before other processing)
    if (line.startsWith('### ')) {
      flushList();
      const content = processInlineFormatting(line.substring(4));
      processedLines.push(`<h3>${content}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      const content = processInlineFormatting(line.substring(3));
      processedLines.push(`<h2>${content}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      const content = processInlineFormatting(line.substring(2));
      processedLines.push(`<h1>${content}</h1>`);
      continue;
    }
    
    // Unordered list items
    const unorderedMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (!inList || inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = false;
      }
      listItems.push(processInlineFormatting(unorderedMatch[2]));
      continue;
    }
    
    // Ordered list items
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (!inList || !inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = true;
      }
      listItems.push(processInlineFormatting(orderedMatch[2]));
      continue;
    }
    
    // Checkbox items (convert to bullet with checkbox text)
    const checkboxMatch = line.match(/^(\s*)[-*]\s+\[([x ])\]\s+(.+)$/i);
    if (checkboxMatch) {
      if (!inList || inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = false;
      }
      const checked = checkboxMatch[2].toLowerCase() === 'x';
      const icon = checked ? '☑' : '☐';
      listItems.push(`${icon} ${processInlineFormatting(checkboxMatch[3])}`);
      continue;
    }
    
    // Table rows (|...|...|)
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch) {
      flushList();
      const cellContent = tableMatch[1];
      // Skip separator rows like |---|---|
      if (/^[\s\-:|]+$/.test(cellContent)) {
        continue;
      }
      inTable = true;
      const cells = cellContent.split('|');
      tableRows.push(cells);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      flushTable();
      // Don't add empty paragraphs
      continue;
    }
    
    // Pass through <details>/<summary> tags as-is
    if (/^<\/?(?:details|summary)/.test(line.trim())) {
      flushList();
      flushTable();
      processedLines.push(line);
      continue;
    }

    // Regular paragraph
    flushList();
    flushTable();
    const content = processInlineFormatting(line);
    if (content.trim()) {
      processedLines.push(`<p>${content}</p>`);
    }
  }
  
  // Flush any remaining list or table
  flushList();
  flushTable();
  
  return processedLines.join('');
}

/**
 * Process inline markdown formatting
 */
function processInlineFormatting(text: string): string {
  let result = text;
  
  // Bold + Italic (***text*** or ___text___)
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  
  // Bold (**text** or __text__)
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic (*text* or _text_)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Inline code (`code`)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  return result;
}

/**
 * Convert HTML back to plain text (for display in non-rich contexts)
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}




