"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { SynthesisHistory } from "@/types";
import { getAllSynthesisHistory, subscribe } from "@/lib/store";
import Table from "@/components/Table";
import Badge from "@/components/Badge";
import { History, Search, ExternalLink } from "lucide-react";

export default function HistoryTab() {
  const router = useRouter();
  const [history, setHistory] = useState<SynthesisHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("");

  useEffect(() => {
    const refresh = () => {
      setHistory(getAllSynthesisHistory());
    };
    refresh();
    return subscribe(refresh);
  }, []);

  const filtered = useMemo(() => {
    let items = [...history];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (h) =>
          (h.generatedTitle || "").toLowerCase().includes(q) ||
          h.draftId.toLowerCase().includes(q)
      );
    }

    if (filterType) {
      items = items.filter((h) => h.synthesisType === filterType);
    }

    if (filterOutcome) {
      items = items.filter((h) => h.outcome === filterOutcome);
    }

    // Sort by date desc
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return items;
  }, [history, searchQuery, filterType, filterOutcome]);

  const handleRowClick = (courseId: string) => {
    // Navigate to the course in the Courses module
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const outcomeVariant = (outcome?: string) => {
    switch (outcome) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No History Yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Course generation history will appear here after your first AI-generated course.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or course ID..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">All Types</option>
          <option value="micro-lesson">Micro-Lesson</option>
          <option value="full-course">Full Course</option>
          <option value="onboarding-path">Onboarding Path</option>
        </select>
        <select
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">All Outcomes</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
        <span className="text-xs text-gray-400">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <Table headers={["Title", "Type", "Status", "Sources", "Lessons", "Outcome", "Date", ""]}>
        {filtered.map((record) => (
          <tr
            key={record.id}
            onClick={() => handleRowClick(record.draftId)}
            className="hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <td className="px-6 py-4 text-sm text-gray-800 font-medium max-w-xs truncate">
              {record.generatedTitle || record.draftId}
            </td>
            <td className="px-6 py-4">
              <Badge variant="default">
                {record.synthesisType}
              </Badge>
            </td>
            <td className="px-6 py-4">
              <Badge variant={record.status === "success" ? "success" : "error"}>
                {record.status}
              </Badge>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {record.sourceCount}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {record.lessonCount}
            </td>
            <td className="px-6 py-4">
              {record.outcome ? (
                <Badge variant={outcomeVariant(record.outcome)}>
                  {record.outcome}
                </Badge>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
              {new Date(record.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
