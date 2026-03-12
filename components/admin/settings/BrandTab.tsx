"use client";

import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Upload, X, ImageIcon } from "lucide-react";
import { getOrganization, updateBrandSettings, subscribe } from "@/lib/store";

export default function BrandTab() {
  const [organization, setOrganization] = useState(getOrganization());
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor);
  const [logo, setLogo] = useState(organization.logo);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const org = getOrganization();
      setOrganization(org);
      setPrimaryColor(org.primaryColor);
      setLogo(org.logo);
    });
    return unsubscribe;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandSettings(primaryColor, logo);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setPrimaryColor("#2563EB");
    setLogo("");
  };

  const handleUpload = async (file: File) => {
    setUploadError(null);

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a PNG, JPG, WebP, or SVG file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File must be under 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.ok) {
        setLogo(data.url);
      } else {
        setUploadError(data.error || "Upload failed.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemoveLogo = () => {
    setLogo("");
  };

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Primary Color */}
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="#2563EB"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This color will be applied to buttons, links, and other primary UI elements.
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Logo
          </label>

          {logo ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">Preview (actual header size)</span>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove Logo
                </button>
              </div>
              <div className="bg-white border border-gray-100 rounded-md p-3 inline-block">
                <img src={logo} alt="Logo preview" className="h-8 object-contain" />
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                }
              `}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600">Click to upload</span>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                  </div>
                  <span className="text-xs text-gray-400">PNG, JPG, WebP, or SVG &middot; Max 2 MB</span>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadError && (
            <p className="mt-2 text-xs text-red-600">{uploadError}</p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            Recommended: PNG with transparency, around 200 &times; 40 px. This logo will appear in the learner header.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset to Default
          </Button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
