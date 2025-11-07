// Phase II — 1N.3: Library Picker Modal for Lesson Builder
"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import LibraryFiltersComponent from "./LibraryFilters";
import { LibraryItem } from "@/types";
import { getLibraryItems, LibraryFilters } from "@/lib/store";
import { Check } from "lucide-react";

interface LibraryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (itemIds: string[]) => void;
}

export default function LibraryPicker({ isOpen, onClose, onSelect }: LibraryPickerProps) {
  const [filters, setFilters] = useState<LibraryFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const items = getLibraryItems(filters);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelect = () => {
    onSelect(Array.from(selectedIds));
    setSelectedIds(new Set());
    setFilters({});
    onClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setFilters({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add from Library"
      size="large"
    >
      <div className="p-6">
        {/* Filters */}
        <LibraryFiltersComponent filters={filters} onChange={setFilters} />

        {/* View Toggle */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="text-sm text-gray-600">
            {items.length} item{items.length !== 1 ? 's' : ''} found
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "list" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "grid" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Items List/Grid */}
        <div className="border border-gray-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No items found. Try adjusting your filters.
            </div>
          ) : viewMode === "list" ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedIds.has(item.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {selectedIds.has(item.id) ? (
                          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.title}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-3 gap-4 p-4">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(item.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
                    </div>
                    {selectedIds.has(item.id) && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {item.type === "file" ? item.fileType : item.source}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSelect}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ""}Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
}

