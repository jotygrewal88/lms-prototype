"use client";

// Keter / Anderson learner slide visual frame.
// Shared visual chrome for both SlidePlayer (deck-only sections) and
// NarrationPlayer (narrated walkthrough sections). Centralizing the slide
// rendering here means a single component owns the polish:
//   - 16:9 aspect-ratio frame, no nested card chrome (the parent surface
//     already provides border/shadow, so the SlideFrame stays flat to avoid
//     a card-within-a-card visual)
//   - Top accent color bar
//   - Bold typographic title with accent underline
//   - Optional inline SVG diagram between the title and the body. When
//     `slide.diagram` is set (a non-empty SVG markup string from
//     lib/keter/visuals.ts), the diagram becomes the primary content of
//     the slide: it takes ALL remaining vertical space (flex-1 + min-h-0),
//     and the slide body collapses into a small caption strip directly
//     below the diagram (max-h-20, prose-sm). Diagram-only slides are
//     authored to have caption-length bodies (~20–40 words) so the small
//     body region is sufficient. The inner <svg> is forced to width:100%
//     and height:auto so width drives the rendered size; max-h-full caps
//     the SVG element height so it never overflows the container, and
//     the browser's default preserveAspectRatio ("xMidYMid meet") scales
//     the inner viewBox content to fit while preserving aspect (no
//     clipping). To minimize empty horizontal margins around the SVG,
//     diagram SVGs in lib/keter/visuals.ts are authored with viewBox
//     aspect ratios ≥ ~3:1 — wider than the diagram container's effective
//     aspect — so width is the binding dimension and the SVG fills the
//     full container width.
//   - Body content rendered as Markdown / HTML so numbered/unordered lists,
//     bold, italic, and tables in slide bodies all render natively (the
//     mockAIAgent slide bodies use Markdown bullets, numbered lists, and
//     bolding; previously they rendered as raw whitespace-pre-wrap text)
//   - Page number indicator (e.g. "Slide 3 of 6") in the lower-right
//   - Anderson Plant brand mark in the lower-left to reinforce the
//     customization story
//
// The slide content area uses overflow-hidden, not overflow-y-auto: the
// frame is a fixed 16:9 canvas and slides are authored to fit. When a
// diagram is present, the body region is capped (max-h-20) so the diagram
// dominates the slide; when no diagram is present, the body takes the
// full remaining flex space.
//
// slide.imageUrl may be populated with placeholder URLs but is intentionally
// NOT read here: until real images are added, slides render as text-only so
// empty placeholders don't make every slide read as broken.

import React from "react";
import type { Slide } from "@/types";
import { markdownToHtml } from "@/lib/keter/markdownToHtml";

interface SlideFrameProps {
  slide: Slide;
  index: number;
  total: number;
}

// Pre-process slide body so the unicode bullet character `•` (used in the
// authored slide content for readable plain-text rendering) survives the
// Markdown converter as a real `<ul><li>...</li></ul>`. The Keter Markdown
// converter only recognizes `-` and `*` as bullet markers; without this swap,
// `•` lines fall through as paragraphs.
function normalizeSlideMarkdown(body: string): string {
  return body
    .split("\n")
    .map((line) => line.replace(/^(\s*)•\s+/, "$1- "))
    .join("\n");
}

export default function SlideFrame({ slide, index, total }: SlideFrameProps) {
  const bodyHtml = markdownToHtml(normalizeSlideMarkdown(slide.body || ""));
  const hasDiagram = !!(slide.diagram && slide.diagram.trim().length > 0);

  return (
    <div className="aspect-video bg-white rounded-2xl overflow-hidden flex flex-col relative">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 flex-shrink-0" />

      {/* Content area, fixed 16:9 — no slide-level scroll */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden min-h-0">
        <div className="mb-3 md:mb-4 flex-shrink-0">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {slide.title}
          </h3>
          <div className="mt-2 h-1 w-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" />
        </div>

        {hasDiagram ? (
          <>
            {/* Diagram container takes ALL remaining space (flex-1 +
              * min-h-0). Inner SVG is forced to width:100% so the SVG
              * always fills the container's full width; height:auto +
              * max-h-full lets the SVG either fill the container's height
              * (when its aspect matches the container) or shorten with
              * vertical centering (when the SVG is wider than the
              * container). Diagrams in lib/keter/visuals.ts are authored
              * with aspect ratios ≥ 3:1 so width is the binding dimension
              * and horizontal margins are minimized.
              */}
            <div
              className="w-full flex-1 min-h-0 bg-slate-50 rounded-md border border-slate-200 px-3 py-2 overflow-hidden flex items-center justify-center [&>svg]:block [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-full"
              dangerouslySetInnerHTML={{ __html: slide.diagram as string }}
            />
            {/* Caption strip beneath the diagram — small + scrollable so a
              * slightly long caption never blows the diagram out of frame.
              */}
            <div
              className="prose prose-sm max-w-none flex-shrink-0 mt-3 max-h-20 overflow-hidden text-gray-700 leading-snug prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:my-0.5 prose-p:my-1"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </>
        ) : (
          <div
            className="prose prose-base max-w-none flex-1 min-h-0 overflow-hidden text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:my-1 prose-p:my-2"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}
      </div>

      {/* Footer brand + page indicator */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-10 py-3 border-t border-gray-100 bg-gray-50/50 text-xs">
        <span className="font-semibold text-gray-500 tracking-wide uppercase">
          Anderson Plant · Injection Molding Certification
        </span>
        <span className="text-gray-400 font-medium">
          Slide {index + 1} of {total}
        </span>
      </div>
    </div>
  );
}
