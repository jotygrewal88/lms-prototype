// Phase II — 1N.3: Library Filters Component
"use client";

import React from "react";
import { LibraryFilters as LibraryFiltersType } from "@/lib/store";
import { getSites, getDepartments, getLibraryItems } from "@/lib/store";
import { X } from "lucide-react";

interface LibraryFiltersProps {
  filters: LibraryFiltersType;
  onChange: (filters: LibraryFiltersType) => void;
}

export default function LibraryFiltersComponent({ filters, onChange }: LibraryFiltersProps) {
  const sites = getSites();
  const departments = getDepartments();
  const allItems = getLibraryItems({ includeArchived: true });
  
  // Extract unique tags and categories from all items
  const allTags = Array.from(new Set(allItems.flatMap(item => item.tags))).sort();
  const allCategories = Array.from(new Set(allItems.flatMap(item => item.categories))).sort();

  const updateFilter = <K extends keyof LibraryFiltersType>(key: K, value: LibraryFiltersType[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = 
    filters.type || 
    filters.fileType || 
    filters.source || 
    (filters.tags && filters.tags.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    filters.siteId ||
    filters.departmentId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by title, description, or tags..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value || undefined)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Type */}
        <select
          value={filters.type || ""}
          onChange={(e) => updateFilter("type", e.target.value as "file" | "link" | undefined || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="file">Files</option>
          <option value="link">Links</option>
        </select>

        {/* File Type */}
        <select
          value={filters.fileType || ""}
          onChange={(e) => updateFilter("fileType", e.target.value as LibraryFilters["fileType"] || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All File Types</option>
          <option value="pdf">PDF</option>
          <option value="ppt">PPT</option>
          <option value="pptx">PPTX</option>
          <option value="doc">DOC</option>
          <option value="docx">DOCX</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>

        {/* Source */}
        <select
          value={filters.source || ""}
          onChange={(e) => updateFilter("source", e.target.value as LibraryFilters["source"] || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sources</option>
          <option value="upload">Upload</option>
          <option value="loom">Loom</option>
          <option value="teams">Teams</option>
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="sharepoint">SharePoint</option>
          <option value="drive">Google Drive</option>
          <option value="other">Other</option>
        </select>

        {/* Tags */}
        <select
          value={filters.tags?.[0] || ""}
          onChange={(e) => {
            const tag = e.target.value;
            updateFilter("tags", tag ? [tag] : undefined);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {/* Site */}
        <select
          value={filters.siteId || ""}
          onChange={(e) => updateFilter("siteId", e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sites</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        {/* Department */}
        <select
          value={filters.departmentId || ""}
          onChange={(e) => updateFilter("departmentId", e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!filters.siteId}
        >
          <option value="">All Departments</option>
          {departments
            .filter(dept => !filters.siteId || dept.siteId === filters.siteId)
            .map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
        </select>
      </div>

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                Type: {filters.type}
                <button onClick={() => updateFilter("type", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.fileType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                {filters.fileType}
                <button onClick={() => updateFilter("fileType", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.source && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                {filters.source}
                <button onClick={() => updateFilter("source", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                Tag: {filters.tags[0]}
                <button onClick={() => updateFilter("tags", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.siteId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                Site: {sites.find(s => s.id === filters.siteId)?.name}
                <button onClick={() => updateFilter("siteId", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.departmentId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                Dept: {departments.find(d => d.id === filters.departmentId)?.name}
                <button onClick={() => updateFilter("departmentId", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                Search: {filters.search}
                <button onClick={() => updateFilter("search", undefined)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

