// Phase II 1H.3: Client-side PDF generation for certificates
"use client";

import { Certificate, CertificateTemplate } from "@/types";
import { updateCertificatePdf } from "@/lib/store";

/**
 * Render a certificate to PDF using html2canvas and jsPDF
 * Dynamically imports libraries to avoid SSR issues
 * @param certificate The certificate to render
 * @param template The template to use for rendering
 * @param elementId Optional ID of the DOM element to render (defaults to 'certificate-render')
 * @returns Promise resolving to the blob URL of the generated PDF
 */
export async function renderCertificatePdf(
  certificate: Certificate,
  template: CertificateTemplate,
  elementId: string = "certificate-render"
): Promise<string> {
  // Dynamic imports (client-only, no SSR)
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // Find the certificate render element
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Certificate render element with id "${elementId}" not found`);
  }

  // Render DOM to canvas with scale 2 for crisp output
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Create PDF with A4/Letter sizing (landscape)
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4", // A4 size (also works for Letter)
  });

  // Get canvas dimensions - landscape A4: 297mm x 210mm
  const imgWidth = 297; // A4 landscape width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add image to PDF
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  // Generate blob URL
  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Update certificate with PDF URL
  updateCertificatePdf(certificate.id, blobUrl);

  return blobUrl;
}

