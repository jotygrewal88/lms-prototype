// Phase II — 1N.3: Bulk Upload Modal for Library
"use client";

import React, { useState, useCallback } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import UploadDropzone from "@/components/UploadDropzone";
import TagInput from "@/components/common/TagInput";
import CategoryInput from "@/components/common/CategoryInput";
import { Upload, X, AlertCircle } from "lucide-react";
import { 
  getLibraryItems, 
  bulkCreateLibraryItems, 
  computeChecksum,
  getSites,
  getDepartments,
  getCurrentUser
} from "@/lib/store";
import { LibraryItem, LibraryItemFileType } from "@/types";
import { inferFileTypeFromExtension, formatFileSize } from "@/lib/library";

interface UploadFilePreview {
  file: File;
  fileType: LibraryItemFileType;
  title: string;
  size: number;
  checksum: string;
  isDuplicate?: boolean;
  duplicateItemId?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function UploadModal({ isOpen, onClose, onComplete }: UploadModalProps) {
  const [files, setFiles] = useState<UploadFilePreview[]>([]);
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [commonCategories, setCommonCategories] = useState<string[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const sites = getSites();
  const departments = getDepartments();
  const currentUser = getCurrentUser();

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const existingItems = getLibraryItems();
    const previews: UploadFilePreview[] = selectedFiles.map(file => {
      const fileType = inferFileTypeFromExtension(file.name);
      const title = file.name.replace(/\.[^/.]+$/, '');
      const checksum = computeChecksum(file.name, file.size);
      
      // Check for duplicates
      const duplicate = existingItems.find(item => item.checksum === checksum);
      
      return {
        file,
        fileType,
        title,
        size: file.size,
        checksum,
        isDuplicate: !!duplicate,
        duplicateItemId: duplicate?.id,
      };
    });
    
    setFiles(previews);
    setUploadErrors([]);
  }, []);

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...files];
    updated[index].title = newTitle;
    setFiles(updated);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConfirmUpload = async () => {
    setIsUploading(true);
    setUploadErrors([]);
    
    try {
      const itemsToCreate: Array<Omit<LibraryItem, "id" | "createdAt" | "updatedAt" | "version">> = [];
      
      for (const preview of files) {
        // Skip duplicates unless user explicitly wants to keep
        if (preview.isDuplicate) {
          continue; // Skip duplicates - user can handle them separately
        }
        
        try {
          // Upload file using existing API
          const formData = new FormData();
          formData.append('file', preview.file);
          
          // Determine resource type for upload API
          let resourceType = 'pdf';
          if (preview.fileType === 'image') resourceType = 'image';
          else if (preview.fileType === 'video') resourceType = 'video';
          
          formData.append('type', resourceType);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          
          if (result.ok) {
            itemsToCreate.push({
              type: "file",
              title: preview.title,
              tags: commonTags,
              categories: commonCategories,
              fileType: preview.fileType,
              url: result.url,
              source: "upload",
              siteId: selectedSiteId || undefined,
              departmentId: selectedDepartmentId || undefined,
              createdByUserId: currentUser.id,
              checksum: preview.checksum,
              fileName: result.fileName,
              fileSize: result.fileSize,
              mimeType: result.mimeType,
            });
          } else {
            setUploadErrors(prev => [...prev, `${preview.file.name}: ${result.error}`]);
          }
        } catch (error) {
          setUploadErrors(prev => [...prev, `${preview.file.name}: Upload failed`]);
        }
      }
      
      if (itemsToCreate.length > 0) {
        bulkCreateLibraryItems(itemsToCreate);
        onComplete();
        handleClose();
      } else if (uploadErrors.length > 0) {
        // Show errors but don't close
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadErrors(["Failed to upload files. Please try again."]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setCommonTags([]);
    setCommonCategories([]);
    setSelectedSiteId("");
    setSelectedDepartmentId("");
    setUploadErrors([]);
    onClose();
  };

  const hasDuplicates = files.some(f => f.isDuplicate);
  const nonDuplicateFiles = files.filter(f => !f.isDuplicate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Files to Library"
      size="large"
    >
      <div className="p-6 space-y-6">
        {/* Upload Zone */}
        <div>
          <UploadDropzone
            accept="*/*"
            onFiles={handleFilesSelected}
            multiple={true}
            disabled={isUploading}
          />
        </div>

        {/* Common Metadata */}
        {files.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Tags (applied to all files)
              </label>
              <TagInput tags={commonTags} onChange={setCommonTags} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Categories (applied to all files)
              </label>
              <CategoryInput categories={commonCategories} onChange={setCommonCategories} />
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
                  disabled={!selectedSiteId}
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
          </div>
        )}

        {/* Files Preview */}
        {files.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Files to Upload ({nonDuplicateFiles.length})
            </h3>
            
            {hasDuplicates && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Duplicate files detected</p>
                    <p>Some files match existing library items. They will be skipped. You can upload them separately if needed.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((preview, index) => (
                    <tr key={index} className={preview.isDuplicate ? "bg-yellow-50" : ""}>
                      <td className="px-4 py-3 text-sm text-gray-900">{preview.file.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{preview.fileType}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={preview.title}
                          onChange={(e) => handleTitleChange(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={preview.isDuplicate}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(preview.size)}</td>
                      <td className="px-4 py-3">
                        {preview.isDuplicate ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Duplicate
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ready
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {uploadErrors.length > 0 && (
          <div className="border-t pt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-2">Upload Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {uploadErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmUpload}
            disabled={isUploading || nonDuplicateFiles.length === 0}
          >
            {isUploading ? "Uploading..." : `Upload ${nonDuplicateFiles.length} File${nonDuplicateFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

