// Phase II — 1N.3: Preview Drawer for Library Items
"use client";

import React, { useState } from "react";
import { X, Download, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";
import { LibraryItem, LibraryItemFileType } from "@/types";
import { getVideoEmbedUrl } from "@/lib/library";
import TagInput from "@/components/common/TagInput";
import CategoryInput from "@/components/common/CategoryInput";
import Button from "@/components/Button";
import { updateLibraryItem, getCurrentUser, getSites, getDepartments } from "@/lib/store";

interface PreviewDrawerProps {
  item: LibraryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function PreviewDrawer({ item, isOpen, onClose, onUpdate }: PreviewDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editSiteId, setEditSiteId] = useState<string>("");
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [imageZoom, setImageZoom] = useState(1);

  const currentUser = getCurrentUser();
  const sites = getSites();
  const departments = getDepartments();
  const canEdit = currentUser.role === "ADMIN" || 
    (currentUser.role === "MANAGER" && 
     (!item?.siteId || item.siteId === currentUser.siteId) &&
     (!item?.departmentId || item.departmentId === currentUser.departmentId));

  React.useEffect(() => {
    if (item) {
      setEditTitle(item.title);
      setEditDescription(item.description || "");
      setEditTags([...item.tags]);
      setEditCategories([...item.categories]);
      setEditSiteId(item.siteId || "");
      setEditDepartmentId(item.departmentId || "");
      setImageZoom(1);
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    
    try {
      updateLibraryItem(item.id, {
        title: editTitle,
        description: editDescription,
        tags: editTags,
        categories: editCategories,
        siteId: editSiteId || undefined,
        departmentId: editDepartmentId || undefined,
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. You may not have permission.");
    }
  };

  const handleCancel = () => {
    if (item) {
      setEditTitle(item.title);
      setEditDescription(item.description || "");
      setEditTags([...item.tags]);
      setEditCategories([...item.categories]);
      setEditSiteId(item.siteId || "");
      setEditDepartmentId(item.departmentId || "");
    }
    setIsEditing(false);
  };

  if (!isOpen || !item) return null;

  const renderPreview = () => {
    if (item.type === "file") {
      // PDF Preview
      if (item.fileType === "pdf" && item.url) {
        return (
          <div className="w-full h-full">
            <iframe
              src={item.url}
              className="w-full h-full border-0"
              title={item.title}
            />
          </div>
        );
      }
      
      // Image Preview
      if (item.fileType === "image" && item.url) {
        return (
          <div className="flex items-center justify-center bg-gray-100 p-4">
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                src={item.url}
                alt={item.title}
                style={{ transform: `scale(${imageZoom})`, transition: 'transform 0.2s' }}
                className="max-w-full h-auto"
              />
              <div className="absolute top-4 right-4 flex gap-2 bg-white rounded-md shadow-lg p-1">
                <button
                  onClick={() => setImageZoom(Math.min(imageZoom + 0.25, 3))}
                  className="p-2 hover:bg-gray-100 rounded"
                  disabled={imageZoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImageZoom(Math.max(imageZoom - 0.25, 0.5))}
                  className="p-2 hover:bg-gray-100 rounded"
                  disabled={imageZoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }
      
      // PPT/DOC - Show metadata + download
      if (item.fileType === "ppt" || item.fileType === "pptx" || item.fileType === "doc" || item.fileType === "docx") {
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {item.fileType.toUpperCase()} file - Preview not available
              </p>
              {item.url && (
                <a
                  href={item.url}
                  download={item.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              )}
            </div>
          </div>
        );
      }
      
      // Other files
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">📎</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">Preview not available</p>
            {item.url && (
              <a
                href={item.url}
                download={item.fileName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            )}
          </div>
        </div>
      );
    }
    
    // Link type
    if (item.type === "link" && item.url) {
      const embedUrl = item.source ? getVideoEmbedUrl(item.url, item.source) : null;
      
      // YouTube, Vimeo, Loom with embed support
      if (embedUrl && (item.source === "youtube" || item.source === "vimeo" || item.source === "loom")) {
        return (
          <div className="w-full h-full">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          </div>
        );
      }
      
      // Teams or other links - show "Open in new tab"
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{item.url}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full p-8 bg-gray-50">
        <p className="text-gray-600">Preview not available</p>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="secondary"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                className="text-sm"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            )}
            {isEditing && canEdit && (
              <Button
                variant="primary"
                onClick={handleSave}
                className="text-sm"
              >
                Save
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Preview Pane */}
          <div className="flex-1 overflow-auto bg-white">
            {renderPreview()}
          </div>

          {/* Metadata Pane */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto bg-gray-50 p-6 space-y-6">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <TagInput tags={editTags} onChange={setEditTags} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <CategoryInput categories={editCategories} onChange={setEditCategories} />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site
                    </label>
                    <select
                      value={editSiteId}
                      onChange={(e) => setEditSiteId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Sites</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={editDepartmentId}
                      onChange={(e) => setEditDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Departments</option>
                      {departments
                        .filter(dept => !editSiteId || dept.siteId === editSiteId)
                        .map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Details</h3>
                  <p className="text-sm text-gray-900">{item.description || "No description"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Type</h3>
                  <span className="inline-block px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                    {item.type === "file" ? item.fileType?.toUpperCase() : item.source}
                  </span>
                </div>
                
                {item.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.fileSize && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">File Size</h3>
                    <p className="text-sm text-gray-900">
                      {item.fileSize > 1024 * 1024
                        ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : `${(item.fileSize / 1024).toFixed(2)} KB`}
                    </p>
                  </div>
                )}
                
                {item.version > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Version</h3>
                    <p className="text-sm text-gray-900">v{item.version}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

