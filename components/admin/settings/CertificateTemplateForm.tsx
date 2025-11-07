// Phase II 1H.3: Certificate Template Form Component
"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { 
  createCertificateTemplate, 
  updateCertificateTemplate,
  getEffectiveCertificateTemplate 
} from "@/lib/store";
import { CertificateTemplate, Certificate } from "@/types";
import CertificateRender from "@/components/certificates/CertificateRender";
import { today } from "@/lib/utils";

interface CertificateTemplateFormProps {
  template: CertificateTemplate | null;
  onClose: () => void;
}

export default function CertificateTemplateForm({
  template,
  onClose,
}: CertificateTemplateFormProps) {
  const isEdit = !!template;
  
  const [name, setName] = useState(template?.name || "");
  const [backgroundUrl, setBackgroundUrl] = useState(template?.backgroundUrl || "");
  const [primaryColor, setPrimaryColor] = useState(template?.primaryColor || "#2563EB");
  const [accentColor, setAccentColor] = useState(template?.accentColor || "#1E40AF");
  const [showOrgLogo, setShowOrgLogo] = useState(template?.showOrgLogo ?? true);
  const [showSignatures, setShowSignatures] = useState(template?.showSignatures ?? true);
  const [showCourseTitle, setShowCourseTitle] = useState(template?.fields?.showCourseTitle ?? true);
  const [showUserName, setShowUserName] = useState(template?.fields?.showUserName ?? true);
  const [showIssuedAt, setShowIssuedAt] = useState(template?.fields?.showIssuedAt ?? true);
  const [showSerial, setShowSerial] = useState(template?.fields?.showSerial ?? true);
  const [showCustomText, setShowCustomText] = useState(template?.fields?.showCustomText ?? false);
  const [customText, setCustomText] = useState(template?.fields?.customText || "");
  const [signatures, setSignatures] = useState<Array<{ title: string; name: string }>>(
    template?.signatures || [{ title: "", name: "" }]
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAddSignature = () => {
    setSignatures([...signatures, { title: "", name: "" }]);
  };

  const handleRemoveSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  const handleSignatureChange = (index: number, field: "title" | "name", value: string) => {
    const updated = [...signatures];
    updated[index][field] = value;
    setSignatures(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData: Omit<CertificateTemplate, "id" | "createdAt" | "updatedAt"> = {
      name,
      backgroundUrl: backgroundUrl || undefined,
      primaryColor,
      accentColor,
      showOrgLogo,
      showSignatures,
      fields: {
        showCourseTitle,
        showUserName,
        showIssuedAt,
        showSerial,
        showCustomText,
        customText: showCustomText ? customText : undefined,
      },
      signatures: showSignatures ? signatures.filter(s => s.title && s.name) : undefined,
      isDefault: template?.isDefault || false,
    };

    if (isEdit && template) {
      updateCertificateTemplate(template.id, templateData);
    } else {
      createCertificateTemplate(templateData);
    }
    
    onClose();
  };

  // Sample certificate for preview
  const sampleCertificate = {
    id: "preview",
    courseId: "preview",
    userId: "preview",
    issuedAt: today(),
    serial: "CRT-DEMO-0001",
    courseTitle: "PPE Safety 101",
    userName: "Jane Doe",
    orgName: "UpKeep Demo Co",
    createdAt: today(),
    updatedAt: today(),
  } as Certificate;

  const previewTemplate: CertificateTemplate = {
    id: "preview",
    name: name || "Preview Template",
    backgroundUrl: backgroundUrl || undefined,
    primaryColor,
    accentColor,
    showOrgLogo,
    showSignatures,
    fields: {
      showCourseTitle,
      showUserName,
      showIssuedAt,
      showSerial,
      showCustomText,
      customText: showCustomText ? customText : undefined,
    },
    signatures: showSignatures ? signatures.filter(s => s.title && s.name) : undefined,
    createdAt: today(),
    updatedAt: today(),
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title={isEdit ? "Edit Template" : "Create Template"}>
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Default Certificate"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image URL (optional)
            </label>
            <input
              type="url"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/certificate-bg.jpg"
            />
          </div>

          {/* Field Toggles */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Fields
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOrgLogo}
                  onChange={(e) => setShowOrgLogo(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Organization Logo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCourseTitle}
                  onChange={(e) => setShowCourseTitle(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Course Title</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUserName}
                  onChange={(e) => setShowUserName(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show User Name</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showIssuedAt}
                  onChange={(e) => setShowIssuedAt(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Issued Date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSerial}
                  onChange={(e) => setShowSerial(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Serial Number</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCustomText}
                  onChange={(e) => setShowCustomText(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Custom Text</span>
              </label>
            </div>
          </div>

          {/* Custom Text */}
          {showCustomText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Text
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter custom text to display on certificate..."
              />
            </div>
          )}

          {/* Signatures */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSignatures}
                  onChange={(e) => setShowSignatures(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Show Signatures</span>
              </label>
              {showSignatures && (
                <button
                  type="button"
                  onClick={handleAddSignature}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Signature
                </button>
              )}
            </div>
            {showSignatures && (
              <div className="space-y-3">
                {signatures.map((sig, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={sig.title}
                      onChange={(e) => handleSignatureChange(index, "title", e.target.value)}
                      placeholder="Title (e.g., Training Manager)"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={sig.name}
                      onChange={(e) => handleSignatureChange(index, "name", e.target.value)}
                      placeholder="Name"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {signatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSignature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="large" title="Certificate Preview">
          <div className="p-6 bg-gray-50 rounded-lg overflow-auto">
            <div className="flex justify-center items-start">
              <div style={{ transform: "scale(0.45)", transformOrigin: "top center", margin: "0 auto" }}>
                <CertificateRender certificate={sampleCertificate} template={previewTemplate} />
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              This is a preview with sample data. Actual certificates will use real course and user information.
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

