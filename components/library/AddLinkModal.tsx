// Phase II — 1N.3: Add Link Modal for Library
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import TagInput from "@/components/common/TagInput";
import CategoryInput from "@/components/common/CategoryInput";
import { createLibraryItem, getSites, getDepartments, getCurrentUser } from "@/lib/store";
import { LibraryItemSource } from "@/types";
import { detectSourceFromUrl } from "@/lib/library";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AddLinkModal({ isOpen, onClose, onComplete }: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<LibraryItemSource>("other");
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const sites = getSites();
  const departments = getDepartments();
  const currentUser = getCurrentUser();

  // Auto-detect source from URL
  useEffect(() => {
    if (url.trim()) {
      const detected = detectSourceFromUrl(url);
      setSource(detected);
    }
  }, [url]);

  const handleSubmit = async () => {
    if (!url.trim() || !title.trim()) {
      alert("Please provide a URL and title");
      return;
    }

    setIsCreating(true);
    try {
      createLibraryItem({
        type: "link",
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        source,
        tags,
        categories,
        siteId: selectedSiteId || undefined,
        departmentId: selectedDepartmentId || undefined,
        createdByUserId: currentUser.id,
      });
      
      handleClose();
      onComplete();
    } catch (error) {
      console.error("Error creating link:", error);
      alert("Failed to create link. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setTitle("");
    setDescription("");
    setSource("other");
    setTags([]);
    setCategories([]);
    setSelectedSiteId("");
    setSelectedDepartmentId("");
    setIsCreating(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Link to Library"
      size="medium"
    >
      <div className="p-6 space-y-4">
        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as LibraryItemSource)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          >
            <option value="upload">Upload</option>
            <option value="loom">Loom</option>
            <option value="teams">Microsoft Teams</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="sharepoint">SharePoint</option>
            <option value="drive">Google Drive</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <TagInput tags={tags} onChange={setTags} disabled={isCreating} />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <CategoryInput categories={categories} onChange={setCategories} disabled={isCreating} />
        </div>

        {/* Scope Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site (optional)
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={isCreating}
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}{site.region && ` (${site.region})`}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department (optional)
            </label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={isCreating || !selectedSiteId}
            >
              <option value="">All Departments</option>
              {departments
                .filter(dept => !selectedSiteId || dept.siteId === selectedSiteId)
                .map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isCreating || !url.trim() || !title.trim()}
          >
            {isCreating ? "Creating..." : "Add Link"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

