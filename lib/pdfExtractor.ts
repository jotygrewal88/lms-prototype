// Phase II 1I.2: PDF Text Extraction Utility
"use client";

/**
 * Extract text content from a PDF file using pdfjs-dist
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source (required for pdfjs-dist)
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Extract text from all pages
    const textParts: string[] = [];
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      textParts.push(pageText);
    }

    // Combine all pages with page breaks
    const fullText = textParts.join('\n\n');
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF. The PDF may contain only images or be encrypted.');
    }

    return fullText;
  } catch (error: any) {
    // Provide user-friendly error messages
    if (error.message) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF and not password-protected.');
  }
}


