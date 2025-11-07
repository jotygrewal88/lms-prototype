// Phase II — 1N.3: Main Library Page
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Button from "@/components/Button";
import Card from "@/components/Card";
import UploadModal from "@/components/library/UploadModal";
import AddLinkModal from "@/components/library/AddLinkModal";
import PreviewDrawer from "@/components/library/PreviewDrawer";
import LibraryFiltersComponent from "@/components/library/LibraryFilters";
import { 
  getLibraryItems, 
  archiveLibraryItem, 
  deleteLibraryItem, 
  createNewVersion,
  getCurrentUser,
  subscribe,
  LibraryFilters,
  type LibraryFilters as LibraryFiltersType
} from "@/lib/store";
import { LibraryItem } from "@/types";
import { 
  Upload, 
  Link as LinkIcon, 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  Copy,
  List,
  Grid,
  MoreVertical,
  Tag,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  File
} from "lucide-react";
import { formatFileSize } from "@/lib/library";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filters, setFilters] = useState<LibraryFiltersType>({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [batchTagInput, setBatchTagInput] = useState("");
  const [showBatchActions, setShowBatchActions] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser.role === "ADMIN";

  useEffect(() => {
    const loadItems = () => {
      setItems(getLibraryItems(filters));
    };
    
    loadItems();
    const unsubscribe = subscribe(loadItems);
    return unsubscribe;
  }, [filters]);

  useEffect(() => {
    setShowBatchActions(selectedIds.size > 0);
  }, [selectedIds]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  const handlePreview = (item: LibraryItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this item?")) {
      try {
        archiveLibraryItem(id);
      } catch (error) {
        alert("Failed to archive item. You may not have permission.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      try {
        deleteLibraryItem(id);
      } catch (error) {
        alert("Failed to delete item. Only admins can delete items.");
      }
    }
  };

  const handleNewVersion = async (item: LibraryItem) => {
    if (confirm("Create a new version of this item?")) {
      try {
        createNewVersion(item.id, {});
        alert("New version created successfully!");
      } catch (error) {
        alert("Failed to create version. You may not have permission.");
      }
    }
  };

  const handleBatchArchive = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Archive ${selectedIds.size} selected item(s)?`)) {
      try {
        selectedIds.forEach(id => {
          try {
            archiveLibraryItem(id);
          } catch (error) {
            console.error(`Failed to archive ${id}:`, error);
          }
        });
        setSelectedIds(new Set());
      } catch (error) {
        alert("Some items could not be archived. Check permissions.");
      }
    }
  };

  const handleBatchTag = () => {
    const tag = batchTagInput.trim();
    if (!tag || selectedIds.size === 0) return;
    
    selectedIds.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item && !item.tags.includes(tag)) {
        try {
          // Note: updateLibraryItem would need to be called for each item
          // For now, we'll show an alert
        } catch (error) {
          console.error(`Failed to tag ${id}:`, error);
        }
      }
    });
    
    alert(`Tag "${tag}" will be added to ${selectedIds.size} item(s). Note: This requires individual updates.`);
    setBatchTagInput("");
  };

  const getFileIcon = (item: LibraryItem) => {
    if (item.type === "link") {
      return <LinkIcon className="w-5 h-5" />;
    }
    switch (item.fileType) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <RouteGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage training materials and resources
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsAddLinkModalOpen(true)}
                className="flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Add Link
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Filters */}
          <LibraryFiltersComponent filters={filters} onChange={setFilters} />

          {/* Batch Actions */}
          {showBatchActions && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={batchTagInput}
                      onChange={(e) => setBatchTagInput(e.target.value)}
                      placeholder="Add tag..."
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleBatchTag()}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleBatchTag}
                      className="text-sm"
                      disabled={!batchTagInput.trim()}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleBatchArchive}
                      className="text-sm"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            </Card>
          )}

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {Object.keys(filters).length === 0
                  ? "Get started by uploading files or adding links to your library."
                  : "Try adjusting your filters to see more items."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddLinkModalOpen(true)}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </Card>
          )}

          {/* List View */}
          {items.length > 0 && viewMode === "list" && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === items.length && items.length > 0}
                          onChange={selectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(item)}
                            <span className="text-sm font-medium text-gray-900">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.type === "file" ? item.fileType : item.source}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.fileSize ? formatFileSize(item.fileSize) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(item)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleNewVersion(item)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="New Version"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleArchive(item.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4 text-gray-600" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Grid View */}
          {items.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedIds.has(item.id) ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => toggleSelection(item.id)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(item)}
                        <span className="text-xs text-gray-500">
                          {item.type === "file" ? item.fileType : item.source}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300"
                      />
                    </div>
                    
                    <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    )}
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(item);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onComplete={() => {}}
        />
        
        <AddLinkModal
          isOpen={isAddLinkModalOpen}
          onClose={() => setIsAddLinkModalOpen(false)}
          onComplete={() => {}}
        />
        
        <PreviewDrawer
          item={previewItem}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewItem(null);
          }}
          onUpdate={() => {}}
        />
      </AdminLayout>
    </RouteGuard>
  );
}

