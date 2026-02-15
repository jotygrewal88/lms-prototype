// Phase II — Unified Add Library Item Modal (Paste / Upload / Link)
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Upload, Link as LinkIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import TagInput from "@/components/common/TagInput";
import CategoryInput from "@/components/common/CategoryInput";
import {
  createLibraryItem,
  getSites,
  getDepartments,
  getCurrentUser,
} from "@/lib/store";
import { LibraryItemSource } from "@/types";
import { detectSourceFromUrl } from "@/lib/library";

type InputMethod = "paste" | "upload" | "link";
type SourceTypeOption = "policy" | "sop" | "manual" | "regulation" | "text" | "";

interface AddLibraryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AddLibraryItemModal({
  isOpen,
  onClose,
  onComplete,
}: AddLibraryItemModalProps) {
  const [method, setMethod] = useState<InputMethod>("paste");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<SourceTypeOption>("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [regulatoryRef, setRegulatoryRef] = useState("");
  const [allowedForSynthesis, setAllowedForSynthesis] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Paste-specific
  const [content, setContent] = useState("");

  // Upload-specific
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link-specific
  const [url, setUrl] = useState("");
  const [linkSource, setLinkSource] = useState<LibraryItemSource>("other");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sites = getSites();
  const departments = getDepartments();
  const currentUser = getCurrentUser();

  // Auto-detect source from URL
  useEffect(() => {
    if (url.trim()) {
      setLinkSource(detectSourceFromUrl(url));
    }
  }, [url]);

  const resetForm = () => {
    setMethod("paste");
    setTitle("");
    setDescription("");
    setSourceType("");
    setCategory("");
    setTags([]);
    setCategories([]);
    setRegulatoryRef("");
    setAllowedForSynthesis(true);
    setSelectedSiteId("");
    setSelectedDepartmentId("");
    setContent("");
    setFile(null);
    setUrl("");
    setLinkSource("other");
    setIsSubmitting(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const getFileType = (
    file: File
  ): "pdf" | "ppt" | "pptx" | "doc" | "docx" | "image" | "video" | "other" => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "pdf";
    if (ext === "ppt") return "ppt";
    if (ext === "pptx") return "pptx";
    if (ext === "doc") return "doc";
    if (ext === "docx") return "docx";
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "other";
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (method === "paste" && !content.trim()) {
      alert("Content is required for pasted text");
      return;
    }
    if (method === "upload" && !file) {
      alert("Please select a file");
      return;
    }
    if (method === "link" && !url.trim()) {
      alert("URL is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (method === "paste") {
        createLibraryItem({
          type: "file",
          title: title.trim(),
          description: description.trim() || undefined,
          content: content,
          tags,
          categories: category.trim()
            ? [...categories, category.trim()]
            : categories,
          sourceType: sourceType || undefined,
          regulatoryRef: regulatoryRef.trim() || undefined,
          allowedForSynthesis,
          siteId: selectedSiteId || undefined,
          departmentId: selectedDepartmentId || undefined,
          createdByUserId: currentUser.id,
        });
      } else if (method === "upload" && file) {
        setIsUploading(true);
        // Mock upload -- in prototype, create an object URL
        const uploadUrl = `/uploads/${Date.now()}_${file.name}`;
        createLibraryItem({
          type: "file",
          title: title.trim(),
          description: description.trim() || undefined,
          fileType: getFileType(file),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          url: uploadUrl,
          source: "upload",
          tags,
          categories: category.trim()
            ? [...categories, category.trim()]
            : categories,
          sourceType: sourceType || undefined,
          regulatoryRef: regulatoryRef.trim() || undefined,
          allowedForSynthesis,
          siteId: selectedSiteId || undefined,
          departmentId: selectedDepartmentId || undefined,
          createdByUserId: currentUser.id,
          checksum: `${file.name.toLowerCase()}_${file.size}`,
        });
      } else if (method === "link") {
        createLibraryItem({
          type: "link",
          title: title.trim(),
          description: description.trim() || undefined,
          url: url.trim(),
          source: linkSource,
          tags,
          categories: category.trim()
            ? [...categories, category.trim()]
            : categories,
          sourceType: sourceType || undefined,
          regulatoryRef: regulatoryRef.trim() || undefined,
          allowedForSynthesis,
          siteId: selectedSiteId || undefined,
          departmentId: selectedDepartmentId || undefined,
          createdByUserId: currentUser.id,
        });
      }

      handleClose();
      onComplete();
    } catch (error) {
      console.error("Error creating library item:", error);
      alert("Failed to create item. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const methodTabs: { id: InputMethod; label: string; icon: React.ReactNode }[] = [
    { id: "paste", label: "Paste Text", icon: <FileText className="w-4 h-4" /> },
    { id: "upload", label: "Upload File", icon: <Upload className="w-4 h-4" /> },
    { id: "link", label: "Add Link", icon: <LinkIcon className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Library" size="large">
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Method Selection Tabs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Method
          </label>
          <div className="flex gap-2">
            {methodTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMethod(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  method === tab.id
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Lockout/Tagout Safety Policy"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* Source Type and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Type
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceTypeOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">None (General)</option>
              <option value="policy">Policy</option>
              <option value="sop">SOP</option>
              <option value="manual">Manual</option>
              <option value="regulation">Regulation</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Safety, Equipment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Method-specific content */}
        {method === "paste" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>{" "}
              <span className="text-gray-400 font-normal">(supports Markdown)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Paste your content here (supports Markdown)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        )}

        {method === "upload" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              {file ? (
                <div className="space-y-1">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-purple-600">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Click to select a file
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOCX, PPTX, images, and more
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.webm"
              className="hidden"
              disabled={isSubmitting}
            />
          </div>
        )}

        {method === "link" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={linkSource}
                onChange={(e) => setLinkSource(e.target.value as LibraryItemSource)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="youtube">YouTube</option>
                <option value="loom">Loom</option>
                <option value="vimeo">Vimeo</option>
                <option value="teams">Microsoft Teams</option>
                <option value="sharepoint">SharePoint</option>
                <option value="drive">Google Drive</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagInput tags={tags} onChange={setTags} disabled={isSubmitting} />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <CategoryInput
            categories={categories}
            onChange={setCategories}
            disabled={isSubmitting}
          />
        </div>

        {/* Scope Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site (optional)
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => {
                setSelectedSiteId(e.target.value);
                setSelectedDepartmentId("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                  {site.region && ` (${site.region})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department (optional)
            </label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting || !selectedSiteId}
            >
              <option value="">All Departments</option>
              {departments
                .filter((dept) => !selectedSiteId || dept.siteId === selectedSiteId)
                .map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Regulatory Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regulatory Reference
          </label>
          <input
            type="text"
            value={regulatoryRef}
            onChange={(e) => setRegulatoryRef(e.target.value)}
            placeholder="e.g., OSHA 1910.147, ISO 9001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {/* AI Synthesis Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowSynthesis"
            checked={allowedForSynthesis}
            onChange={(e) => setAllowedForSynthesis(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            disabled={isSubmitting}
          />
          <label htmlFor="allowSynthesis" className="text-sm text-gray-700">
            Allow AI to use this source for training synthesis
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting
            ? isUploading
              ? "Uploading..."
              : "Adding..."
            : "Add to Library"}
        </Button>
      </div>
    </Modal>
  );
}
