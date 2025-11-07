// Phase II 1H.3: Enhanced Certificate Modal Component
"use client";

import React, { useState, useEffect } from "react";
import { X, Award, Download, Copy, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { Certificate } from "@/types";
import { formatDate } from "@/lib/utils";
import { getCertificateTemplateById, getEffectiveCertificateTemplate } from "@/lib/store";
import { renderCertificatePdf } from "@/lib/pdf";
import CertificateRender from "@/components/certificates/CertificateRender";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: Certificate[];
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificates,
}: CertificateModalProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(
    certificates.length > 0 ? certificates[0] : null
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset selected certificate when modal opens/closes or certificates change
  useEffect(() => {
    if (isOpen && certificates.length > 0) {
      setSelectedCertificate(certificates[0]);
    }
  }, [isOpen, certificates]);

  const handleDownloadPdf = async () => {
    if (!selectedCertificate) return;

    setIsGeneratingPdf(true);
    try {
      // Get template
      const template = selectedCertificate.templateId
        ? getCertificateTemplateById(selectedCertificate.templateId)
        : getEffectiveCertificateTemplate();

      if (!template) {
        alert("Certificate template not found");
        return;
      }

      // Generate PDF if not already generated
      let pdfUrl = selectedCertificate.pdfUrl;
      if (!pdfUrl) {
        pdfUrl = await renderCertificatePdf(selectedCertificate, template);
      }

      // Download PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `certificate-${selectedCertificate.serial}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedCertificate) return;

    const template = selectedCertificate.templateId
      ? getCertificateTemplateById(selectedCertificate.templateId)
      : getEffectiveCertificateTemplate();

    if (!template) {
      alert("Certificate template not found");
      return;
    }

    try {
      // Generate PDF if not already generated
      let pdfUrl = selectedCertificate.pdfUrl;
      if (!pdfUrl) {
        setIsGeneratingPdf(true);
        pdfUrl = await renderCertificatePdf(selectedCertificate, template);
        setIsGeneratingPdf(false);
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link. Please try again.");
      setIsGeneratingPdf(false);
    }
  };

  const template = selectedCertificate
    ? selectedCertificate.templateId
      ? getCertificateTemplateById(selectedCertificate.templateId)
      : getEffectiveCertificateTemplate()
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Certificates
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No certificates available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Certificate List */}
              {certificates.length > 1 && (
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <button
                      key={cert.id}
                      onClick={() => setSelectedCertificate(cert)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedCertificate?.id === cert.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {cert.courseTitle || "Course Certificate"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Issued: {formatDate(cert.issuedAt)} • Serial: {cert.serial}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Certificate Preview */}
              {selectedCertificate && template && (
                <div className="space-y-4">
                  {/* Certificate Render */}
                       <div className="bg-gray-50 rounded-lg p-4 overflow-auto border-2 border-gray-200">
                         <div className="flex justify-center items-start">
                           <div style={{ transform: "scale(0.45)", transformOrigin: "top center", margin: "0 auto" }}>
                             <CertificateRender certificate={selectedCertificate} template={template} />
                           </div>
                         </div>
                       </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      {copied ? (
                        "Copied!"
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  {/* Certificate Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Serial Number:</span>
                      <span className="font-mono text-gray-900">{selectedCertificate.serial}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Issued:</span>
                      <span className="text-gray-600">{formatDate(selectedCertificate.issuedAt)}</span>
                    </div>
                    {selectedCertificate.userName && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Recipient:</span>
                        <span className="text-gray-600">{selectedCertificate.userName}</span>
                      </div>
                    )}
                    {selectedCertificate.orgName && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Organization:</span>
                        <span className="text-gray-600">{selectedCertificate.orgName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}


