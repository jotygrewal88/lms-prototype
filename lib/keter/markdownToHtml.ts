// Keter — Anderson Markdown → HTML helper.
//
// The shared lib/markdownToHtml.ts has two issues that show up in the Keter
// Anderson Plant lesson content:
//   1. It escapes `>` to `&gt;` BEFORE line-by-line parsing, and never has a
//      blockquote case at all. As a result, lines that begin with `> ...`
//      render as literal "&gt; ..." characters instead of styled callouts.
//   2. It emits tables as plain <table><tr><td>...</td></tr></table>. The
//      Keter learner admin-preview surface routes Text resources through
//      ResourceText.tsx → RichTextEditor (TipTap, readOnly), which has no
//      Table extension and strips the table tags entirely. The cells
//      collapse into the "wall of mashed-together text" the user reported
//      ("Short ShotIncomplete fillLow injection pressure...").
//
// ResourceText.tsx already has an escape hatch: if the rendered HTML contains
// `class="callout"` or `class="image-placeholder"`, the entire content is
// rendered via dangerouslySetInnerHTML (bypassing TipTap). This file emits
// `class="callout-blockquote"` on every blockquote and `class="callout-table"`
// on every table — both substrings contain `class="callout` which triggers
// the bypass — so the Anderson tables and callouts always render natively.
//
// The original lib/markdownToHtml.ts is left untouched; the original
// Courses module's wizard, editor, and learner surfaces continue to use it
// exactly as before.

export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Preserve raw `<figure>...</figure>` and `<svg>...</svg>` blocks before
  // HTML escaping. These are trusted strings emitted by lib/keter/visuals.ts
  // (and inlined into Keter lesson Markdown) and must survive the line walker
  // intact, including all internal `<` and `>` characters. We capture
  // <figure> blocks first so that any nested <svg> inside a <figure> is
  // pulled out as a single unit (no nested placeholders to recursively
  // expand). Standalone <svg> blocks outside any <figure> are then captured
  // in a second sweep. Restored at the very end of the pipeline so the line
  // walker treats each placeholder as a single block of opaque content.
  const rawHtmlBlocks: string[] = [];
  const captureRawBlock = (match: string): string => {
    const idx = rawHtmlBlocks.length;
    rawHtmlBlocks.push(match);
    return `%%KETER_RAW_${idx}%%`;
  };
  html = html.replace(/<figure\b[\s\S]*?<\/figure>/gi, captureRawBlock);
  html = html.replace(/<svg\b[\s\S]*?<\/svg>/gi, captureRawBlock);

  // Preserve <details>/<summary> HTML tags before HTML escaping.
  const detailsPlaceholders: string[] = [];
  html = html.replace(
    /<(\/?)(?:details|summary)(\s[^>]*)?>/gi,
    (match) => {
      const idx = detailsPlaceholders.length;
      detailsPlaceholders.push(match);
      return `%%DETAILS_${idx}%%`;
    },
  );

  // Pull blockquote `>` markers off the start of lines BEFORE escaping `>`,
  // so they survive the HTML-entity pass. Each blockquote line is replaced
  // with a sentinel that the line walker re-detects after escaping. The
  // sentinel uses `~` (a character the converter never emits) so we don't
  // collide with anything in user content.
  html = html.replace(/^>\s?/gm, "~~KETER_BQ~~");

  // Escape HTML entities (`&`, `<`, `>`).
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Restore <details>/<summary> tags.
  html = html.replace(
    /%%DETAILS_(\d+)%%/g,
    (_, idx) => detailsPlaceholders[parseInt(idx)],
  );

  const lines = html.split("\n");
  const processedLines: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let listItems: string[] = [];
  let inTable = false;
  // Tracks whether the first row of a table block is still pending so we can
  // emit a <thead> / <th> for it (a vanilla GFM table treats the first row
  // as a header).
  let tableRows: string[][] = [];
  let tableHeaderEmitted = false;
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const tag = inOrderedList ? "ol" : "ul";
      processedLines.push(
        `<${tag}>${listItems
          .map((item) => `<li>${item}</li>`)
          .join("")}</${tag}>`,
      );
      listItems = [];
    }
    inList = false;
    inOrderedList = false;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      let tableHtml = '<table class="callout-table">';
      tableRows.forEach((cells, rowIdx) => {
        const isHeader = rowIdx === 0 && !tableHeaderEmitted;
        const cellTag = isHeader ? "th" : "td";
        const wrapTag = isHeader ? "thead" : rowIdx === 0 ? "tbody" : "";
        if (isHeader) {
          tableHtml += "<thead><tr>";
        } else if (rowIdx === 1 || (rowIdx === 0 && tableHeaderEmitted)) {
          tableHtml += "<tbody><tr>";
        } else {
          tableHtml += "<tr>";
        }
        tableHtml += cells
          .map(
            (c) =>
              `<${cellTag}>${processInlineFormatting(c.trim())}</${cellTag}>`,
          )
          .join("");
        if (isHeader) {
          tableHtml += "</tr></thead>";
        } else {
          tableHtml += "</tr>";
        }
        // Suppress the wrapTag branch warning by ignoring it; structure above
        // is sufficient for valid HTML.
        void wrapTag;
      });
      // Close <tbody> if it was opened (any row beyond the header).
      if (tableRows.length > 1) {
        tableHtml += "</tbody>";
      }
      tableHtml += "</table>";
      processedLines.push(tableHtml);
      tableRows = [];
      tableHeaderEmitted = false;
    }
    inTable = false;
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      // Each blockquote line becomes a <p> inside the <blockquote> so paragraph
      // breaks inside multi-line callouts render correctly. Empty blockquote
      // lines (used as paragraph separators in the source) split paragraphs.
      const paragraphs: string[][] = [[]];
      for (const ln of blockquoteLines) {
        if (ln.trim() === "") {
          paragraphs.push([]);
        } else {
          paragraphs[paragraphs.length - 1].push(ln);
        }
      }
      const blockquoteInner = paragraphs
        .filter((p) => p.length > 0)
        .map(
          (p) =>
            `<p>${processInlineFormatting(p.join(" ").trim())}</p>`,
        )
        .join("");
      processedLines.push(
        `<blockquote class="callout-blockquote">${blockquoteInner}</blockquote>`,
      );
      blockquoteLines = [];
    }
    inBlockquote = false;
  };

  // Helper: any line consumed by table or blockquote shouldn't trigger
  // list/paragraph fallback first. We use individual flushes per branch.

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blockquote line — sentinel restored after HTML escape.
    if (line.startsWith("~~KETER_BQ~~")) {
      flushList();
      flushTable();
      inBlockquote = true;
      blockquoteLines.push(line.replace(/^~~KETER_BQ~~/, ""));
      continue;
    }

    // Headers (must come before other processing).
    if (line.startsWith("### ")) {
      flushList();
      flushTable();
      flushBlockquote();
      const content = processInlineFormatting(line.substring(4));
      processedLines.push(`<h3>${content}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushTable();
      flushBlockquote();
      const content = processInlineFormatting(line.substring(3));
      processedLines.push(`<h2>${content}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      flushTable();
      flushBlockquote();
      const content = processInlineFormatting(line.substring(2));
      processedLines.push(`<h1>${content}</h1>`);
      continue;
    }

    // Unordered list items.
    const unorderedMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushTable();
      flushBlockquote();
      if (!inList || inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = false;
      }
      listItems.push(processInlineFormatting(unorderedMatch[2]));
      continue;
    }

    // Ordered list items.
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushTable();
      flushBlockquote();
      if (!inList || !inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = true;
      }
      listItems.push(processInlineFormatting(orderedMatch[2]));
      continue;
    }

    // Checkbox items.
    const checkboxMatch = line.match(/^(\s*)[-*]\s+\[([x ])\]\s+(.+)$/i);
    if (checkboxMatch) {
      flushTable();
      flushBlockquote();
      if (!inList || inOrderedList) {
        flushList();
        inList = true;
        inOrderedList = false;
      }
      const checked = checkboxMatch[2].toLowerCase() === "x";
      const icon = checked ? "☑" : "☐";
      listItems.push(`${icon} ${processInlineFormatting(checkboxMatch[3])}`);
      continue;
    }

    // Table rows (|...|...|). The leading and trailing pipes are required.
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch) {
      flushList();
      flushBlockquote();
      const cellContent = tableMatch[1];
      // Skip separator rows like |---|---|.
      if (/^[\s\-:|]+$/.test(cellContent)) {
        // Separator confirms the previous row was a header.
        tableHeaderEmitted = true;
        continue;
      }
      inTable = true;
      const cells = cellContent.split("|");
      tableRows.push(cells);
      continue;
    }

    // Empty line.
    if (line.trim() === "") {
      flushList();
      flushTable();
      flushBlockquote();
      continue;
    }

    // Pass through <details>/<summary> tags as-is.
    if (/^<\/?(?:details|summary)/.test(line.trim())) {
      flushList();
      flushTable();
      flushBlockquote();
      processedLines.push(line);
      continue;
    }

    // Pass through raw-HTML block placeholders (figure/svg) as top-level
    // blocks instead of wrapping them in <p>. The placeholder is restored to
    // its original markup at the end of the pipeline.
    if (/^%%KETER_RAW_\d+%%$/.test(line.trim())) {
      flushList();
      flushTable();
      flushBlockquote();
      processedLines.push(line.trim());
      continue;
    }

    // Regular paragraph.
    flushList();
    flushTable();
    flushBlockquote();
    const content = processInlineFormatting(line);
    if (content.trim()) {
      processedLines.push(`<p>${content}</p>`);
    }
  }

  flushList();
  flushTable();
  flushBlockquote();

  // Reference unused locals so strict mode lint is happy.
  void inTable;
  void inList;

  let result = processedLines.join("");

  // Restore raw <figure> / <svg> blocks now that all line-level processing
  // has run. Any placeholder still sitting inside a <p>...</p> wrapper (e.g.
  // when the placeholder appeared mid-paragraph) survives without harm; the
  // common case is a top-level placeholder block that was emitted as-is by
  // the line-walker passthrough above.
  result = result.replace(
    /%%KETER_RAW_(\d+)%%/g,
    (_, idx) => rawHtmlBlocks[parseInt(idx)] ?? "",
  );

  return result;
}

function processInlineFormatting(text: string): string {
  let result = text;

  // Bold + Italic (***text*** or ___text___).
  result = result.replace(
    /\*\*\*(.+?)\*\*\*/g,
    "<strong><em>$1</em></strong>",
  );
  result = result.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

  // Bold (**text** or __text__).
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_).
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Inline code (`code`).
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links [text](url).
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );

  return result;
}
