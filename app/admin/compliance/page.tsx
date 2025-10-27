// Phase I Epic 2: Compliance tracking table
// ✅ Epic 2 Acceptance: Filter, search, CSV export; mark completion with proof/notes
// ✅ Permissions: Manager scope enforced (can only mark Plant A/B users); Learner read-only
// ✅ Demo: Filter overdue → mark complete → see expiration calculated
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import CompletionModal from "@/components/CompletionModal";
import { 
  getCompletions, 
  getTrainings, 
  getUsers, 
  getSites, 
  getDepartments,
  getTrainingById,
  getCurrentUser,
  subscribe 
} from "@/lib/store";
import { TrainingCompletion, CompletionStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CompliancePage() {
  const [completions, setCompletions] = useState(getCompletions());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [selectedCompletion, setSelectedCompletion] = useState<TrainingCompletion | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSite, setFilterSite] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterTraining, setFilterTraining] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<CompletionStatus | "">("");

  const trainings = getTrainings();
  const users = getUsers();
  const sites = getSites();
  const departments = getDepartments();

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setCompletions(getCompletions());
      setCurrentUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const getUser = (userId: string) => users.find(u => u.id === userId);
  const getTraining = (trainingId: string) => trainings.find(t => t.id === trainingId);
  const getSite = (siteId?: string) => siteId ? sites.find(s => s.id === siteId) : undefined;
  const getDepartment = (deptId?: string) => deptId ? departments.find(d => d.id === deptId) : undefined;

  const canModifyCompletion = (completion: TrainingCompletion): boolean => {
    if (currentUser.role === "ADMIN") return true;
    if (currentUser.role === "LEARNER") return false;
    
    // Manager: check if user is in their scope
    if (currentUser.role === "MANAGER") {
      const user = getUser(completion.userId);
      return user?.siteId === currentUser.siteId;
    }
    
    return false;
  };

  const handleMarkComplete = (completion: TrainingCompletion) => {
    if (!canModifyCompletion(completion)) {
      alert("You don't have permission to modify this completion.");
      return;
    }
    setSelectedCompletion(completion);
    setIsCompletionModalOpen(true);
  };

  const handleModalSave = () => {
    setCompletions(getCompletions());
  };

  const handleExportCSV = () => {
    // Mock CSV export
    const filtered = getFilteredCompletions();
    const csvContent = [
      ["Training", "Employee", "Site", "Department", "Status", "Due Date", "Completed Date", "Overdue Days", "Notes"],
      ...filtered.map(c => {
        const training = getTraining(c.trainingId);
        const user = getUser(c.userId);
        const site = getSite(user?.siteId);
        const dept = getDepartment(user?.departmentId);
        
        return [
          training?.title || "",
          user?.name || "",
          site?.name || "",
          dept?.name || "",
          c.status,
          formatDate(c.dueAt),
          c.completedAt ? formatDate(c.completedAt) : "",
          c.overdueDays?.toString() || "0",
          c.notes || "",
        ];
      }),
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compliance-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredCompletions = (): TrainingCompletion[] => {
    return completions.filter(completion => {
      const training = getTraining(completion.trainingId);
      const user = getUser(completion.userId);
      
      if (!training || !user) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesUser = user.name.toLowerCase().includes(query);
        const matchesTraining = training.title.toLowerCase().includes(query);
        if (!matchesUser && !matchesTraining) return false;
      }

      // Site filter
      if (filterSite && user.siteId !== filterSite) return false;

      // Department filter
      if (filterDepartment && user.departmentId !== filterDepartment) return false;

      // Training filter
      if (filterTraining && completion.trainingId !== filterTraining) return false;

      // Status filter
      if (filterStatus && completion.status !== filterStatus) return false;

      return true;
    });
  };

  const getStatusBadge = (status: CompletionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "ASSIGNED":
        return <Badge variant="info">Assigned</Badge>;
      case "OVERDUE":
        return <Badge variant="error">Overdue</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredCompletions = getFilteredCompletions();

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
          <Button variant="primary" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Employee or training..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="filterSite" className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <select
                id="filterSite"
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Sites</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="filterDepartment"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterTraining" className="block text-sm font-medium text-gray-700 mb-1">
                Training
              </label>
              <select
                id="filterTraining"
                value={filterTraining}
                onChange={(e) => setFilterTraining(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Trainings</option>
                {trainings.map(training => (
                  <option key={training.id} value={training.id}>{training.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CompletionStatus | "")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {(searchQuery || filterSite || filterDepartment || filterTraining || filterStatus) && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredCompletions.length} of {completions.length} completions</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSite("");
                  setFilterDepartment("");
                  setFilterTraining("");
                  setFilterStatus("");
                }}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompletions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                      No completions found.
                    </td>
                  </tr>
                ) : (
                  filteredCompletions.map((completion) => {
                    const training = getTraining(completion.trainingId);
                    const user = getUser(completion.userId);
                    const site = getSite(user?.siteId);
                    const dept = getDepartment(user?.departmentId);
                    const canModify = canModifyCompletion(completion);

                    return (
                      <tr key={completion.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {training?.title}
                          {training?.standardRef && (
                            <div className="text-xs text-gray-500">{training.standardRef}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{site?.name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{dept?.name || "—"}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(completion.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(completion.dueAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {completion.completedAt ? formatDate(completion.completedAt) : "—"}
                          {completion.proofUrl && (
                            <a
                              href={completion.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary hover:underline text-xs"
                            >
                              View Proof
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {completion.overdueDays && completion.overdueDays > 0 ? (
                            <span className="text-red-600 font-medium">{completion.overdueDays} days</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {completion.status !== "COMPLETED" && (
                            <Button
                              variant="primary"
                              onClick={() => handleMarkComplete(completion)}
                              className="text-xs"
                              disabled={!canModify}
                              title={!canModify ? "You don't have permission to modify this completion" : ""}
                            >
                              Mark Complete
                            </Button>
                          )}
                          {completion.notes && (
                            <div className="mt-1 text-xs text-gray-500 italic" title={completion.notes}>
                              {completion.notes.substring(0, 30)}...
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <CompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          completion={selectedCompletion}
          trainingRetrainDays={selectedCompletion ? getTrainingById(selectedCompletion.trainingId)?.retrainIntervalDays : undefined}
          onSave={handleModalSave}
        />
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}
