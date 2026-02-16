"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Zap, Library, ExternalLink, FileText, ZapOff } from "lucide-react";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { getLibraryItems, updateLibraryItem, subscribe } from "@/lib/store";
import type { LibraryItem } from "@/types";

export default function SourcesTab() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"enabled" | "all">("enabled");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setItems(getLibraryItems());
    update();
    return subscribe(update);
  }, []);

  const enabledSources = useMemo(
    () => items.filter((i) => i.allowedForSynthesis && !i.archivedAt),
    [items]
  );

  const allActiveSources = useMemo(
    () => items.filter((i) => !i.archivedAt),
    [items]
  );

  const displayItems = viewMode === "enabled" ? enabledSources : allActiveSources;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return displayItems;
    const q = searchQuery.toLowerCase();
    return displayItems.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.toLowerCase().includes(q)) ||
        i.regulatoryRef?.toLowerCase().includes(q)
    );
  }, [displayItems, searchQuery]);

  const toggleSynthesis = (item: LibraryItem) => {
    updateLibraryItem(item.id, { allowedForSynthesis: !item.allowedForSynthesis });
    setToast(
      item.allowedForSynthesis
        ? `"${item.title}" removed from AI sources`
        : `"${item.title}" enabled for AI generation`
    );
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Sources</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sources enabled for AI generation are used when creating onboarding paths and courses.
          </p>
        </div>
        <a
          href="/admin/library"
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Library className="w-4 h-4" />
          Go to Library
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enabledSources.length}</p>
              <p className="text-xs text-gray-500">AI-enabled sources</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allActiveSources.length}</p>
              <p className="text-xs text-gray-500">Total library sources</p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Toggle + Search */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode("enabled")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "enabled"
                  ? "bg-emerald-50 text-emerald-700 border-r border-gray-300"
                  : "bg-white text-gray-600 hover:bg-gray-50 border-r border-gray-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5 inline mr-1" />
              AI Enabled ({enabledSources.length})
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Sources ({allActiveSources.length})
            </button>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {viewMode === "enabled" && enabledSources.length === 0 ? (
              <>
                <ZapOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">No sources enabled for AI</p>
                <p className="text-xs text-gray-400 mb-4">
                  Switch to &quot;All Sources&quot; to enable library items for AI generation.
                </p>
                <Button variant="secondary" onClick={() => setViewMode("all")}>
                  Browse All Sources
                </Button>
              </>
            ) : (
              <p className="text-sm">No sources match your search.</p>
            )}
          </div>
        ) : (
          <Table headers={["Source", "Type", "Categories", "Regulatory Ref", "AI Status", "Action"]}>
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="default">{item.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.categories?.map((cat) => (
                      <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.regulatoryRef || "—"}
                </td>
                <td className="px-6 py-4">
                  {item.allowedForSynthesis ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <Zap className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleSynthesis(item)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      item.allowedForSynthesis
                        ? "text-gray-600 border-gray-300 hover:bg-gray-50"
                        : "text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                  >
                    {item.allowedForSynthesis ? "Disable" : "Enable for AI"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
