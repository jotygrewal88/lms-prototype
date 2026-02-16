// User Management: Modal for creating and editing users
// Enhanced with job title, additional managers, and access grants
// Same experience for both new and edit modes
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Plus, Users, Shield, Search, ChevronDown } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import AssignTrainingsModal from "@/components/users/AssignTrainingsModal";
import { 
  createUser, 
  updateUser, 
  getCurrentUser, 
  getSites, 
  getDepartments,
  getUsers,
  getUser,
  assignCoursesToUser,
  createNotification,
  getUserAdditionalManagers,
  addAdditionalManager,
  removeAdditionalManager,
  getUserAccessGrants,
  createUserAccessGrant,
  deleteUserAccessGrant,
  getJobTitles,
  getJobTitleById,
  getOnboardingPathByJobTitleId,
  createOnboardingAssignment,
  analyzeRoleChangeGaps,
  getSkillV2ById,
  createTrainingResponse,
} from "@/lib/store";
import { generateTrainingResponse } from "@/lib/mockTrainingGenerator";
import { User, Role, AccessGrantRelationship, UserAdditionalManager, UserAccessGrant, getFullName } from "@/types";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: User | null;
}

// Temporary types for pending relationships (before user is created)
interface PendingAdditionalManager {
  tempId: string;
  managerId: string;
  relationship: AccessGrantRelationship;
}

interface PendingAccessGrant {
  tempId: string;
  siteId?: string;
  departmentId?: string;
  reason?: string;
}

export default function NewUserModal({ isOpen, onClose, editUser }: NewUserModalProps) {
  const currentUser = getCurrentUser();
  const sites = getSites();
  const departments = getDepartments();
  const allUsers = getUsers(true); // Include inactive for manager selection

  const isAdmin = currentUser.role === "ADMIN";
  const isEditing = !!editUser;

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedJobTitleId, setSelectedJobTitleId] = useState<string>("");
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [assignOnboarding, setAssignOnboarding] = useState(true);
  const [onboardingStartDate, setOnboardingStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [jtSearch, setJtSearch] = useState("");
  const [jtDropdownOpen, setJtDropdownOpen] = useState(false);
  const [role, setRole] = useState<Role>("LEARNER");
  const [siteId, setSiteId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [sendInvite, setSendInvite] = useState(false);

  // Additional managers state (for editing existing users)
  const [additionalManagers, setAdditionalManagers] = useState<UserAdditionalManager[]>([]);
  // Pending additional managers (for new users)
  const [pendingAdditionalManagers, setPendingAdditionalManagers] = useState<PendingAdditionalManager[]>([]);
  const [newAdditionalManagerId, setNewAdditionalManagerId] = useState("");
  const [newAdditionalRelationship, setNewAdditionalRelationship] = useState<AccessGrantRelationship>("co-manager");

  // Access grants state (for editing existing users)
  const [accessGrants, setAccessGrants] = useState<UserAccessGrant[]>([]);
  // Pending access grants (for new users)
  const [pendingAccessGrants, setPendingAccessGrants] = useState<PendingAccessGrant[]>([]);
  const [newGrantSiteId, setNewGrantSiteId] = useState("");
  const [newGrantDeptId, setNewGrantDeptId] = useState("");
  const [newGrantReason, setNewGrantReason] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState<"basic" | "hierarchy" | "access">("basic");

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Training assignment state
  const [showAssignTrainings, setShowAssignTrainings] = useState(false);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<User | null>(null);

  // Role change gap state
  const [roleChangeGap, setRoleChangeGap] = useState<{
    userId: string;
    userName: string;
    newJobTitle: string;
    existingSkills: string[];
    missingSkills: string[];
  } | null>(null);
  const [generatingGapTraining, setGeneratingGapTraining] = useState(false);

  // Initialize form with edit data
  useEffect(() => {
    if (editUser) {
      setFirstName(editUser.firstName);
      setLastName(editUser.lastName);
      setEmail(editUser.email);
      setJobTitle(editUser.jobTitleText || "");
      setSelectedJobTitleId(editUser.jobTitleId || "");
      setUseCustomTitle(!editUser.jobTitleId && !!editUser.jobTitleText);
      setRole(editUser.role);
      setSiteId(editUser.siteId || "");
      setDepartmentId(editUser.departmentId || "");
      setManagerId(editUser.managerId || "");
      // Load additional managers and access grants for this user
      setAdditionalManagers(getUserAdditionalManagers(editUser.id));
      setAccessGrants(getUserAccessGrants(editUser.id));
      setPendingAdditionalManagers([]);
      setPendingAccessGrants([]);
    } else {
      // Reset form for new user
      setFirstName("");
      setLastName("");
      setEmail("");
      setJobTitle("");
      setSelectedJobTitleId("");
      setUseCustomTitle(false);
      setRole("LEARNER");
      setSiteId(currentUser.role === "MANAGER" ? currentUser.siteId || "" : "");
      setDepartmentId(currentUser.role === "MANAGER" ? currentUser.departmentId || "" : "");
      setManagerId("");
      setSendInvite(false);
      setAdditionalManagers([]);
      setAccessGrants([]);
      setPendingAdditionalManagers([]);
      setPendingAccessGrants([]);
    }
    setError(null);
    setNewlyCreatedUser(null);
    setShowAssignTrainings(false);
    setActiveTab("basic");
    setNewAdditionalManagerId("");
    setNewGrantSiteId("");
    setNewGrantDeptId("");
    setNewGrantReason("");
  }, [editUser, isOpen, currentUser]);

  // Filter departments based on selected site
  const availableDepartments = departmentId || siteId
    ? departments.filter(d => d.siteId === siteId)
    : departments;

  // Filter managers based on selected site/dept
  const availableManagers = allUsers.filter(u => {
    if (u.role !== "MANAGER") return false;
    if (!siteId) return true; // Show all managers if no site selected
    if (u.siteId !== siteId) return false;
    // If department is selected, manager must match or be site-level
    if (departmentId && u.departmentId && u.departmentId !== departmentId) return false;
    return true;
  });

  // Get combined additional managers (real + pending)
  const allAdditionalManagerIds = [
    ...additionalManagers.map(am => am.managerId),
    ...pendingAdditionalManagers.map(pam => pam.managerId)
  ];

  // Available managers for additional manager selection (exclude primary manager and already added)
  const availableAdditionalManagers = allUsers.filter(u => {
    if (u.role !== "MANAGER" && u.role !== "ADMIN") return false;
    if (u.id === managerId) return false; // Exclude primary manager
    if (editUser && u.id === editUser.id) return false; // Exclude self
    // Exclude already added additional managers
    if (allAdditionalManagerIds.includes(u.id)) return false;
    return true;
  });

  // Handle adding additional manager
  const handleAddAdditionalManager = () => {
    if (!newAdditionalManagerId) return;
    
    if (isEditing && editUser) {
      // For existing users, add directly to the store
      const newRelation = addAdditionalManager(editUser.id, newAdditionalManagerId, newAdditionalRelationship);
      setAdditionalManagers([...additionalManagers, newRelation]);
    } else {
      // For new users, add to pending list
      setPendingAdditionalManagers([
        ...pendingAdditionalManagers,
        {
          tempId: `temp_${Date.now()}`,
          managerId: newAdditionalManagerId,
          relationship: newAdditionalRelationship,
        }
      ]);
    }
    setNewAdditionalManagerId("");
    setNewAdditionalRelationship("co-manager");
  };

  // Handle removing additional manager
  const handleRemoveAdditionalManager = (am: UserAdditionalManager) => {
    if (!editUser) return;
    removeAdditionalManager(editUser.id, am.managerId);
    setAdditionalManagers(additionalManagers.filter(m => m.id !== am.id));
  };

  // Handle removing pending additional manager
  const handleRemovePendingAdditionalManager = (tempId: string) => {
    setPendingAdditionalManagers(pendingAdditionalManagers.filter(pam => pam.tempId !== tempId));
  };

  // Handle adding access grant
  const handleAddAccessGrant = () => {
    if (!newGrantSiteId && !newGrantDeptId) return;
    
    if (isEditing && editUser) {
      // For existing users, add directly to the store
      const newGrant = createUserAccessGrant(editUser.id, currentUser.id, {
        siteId: newGrantSiteId || undefined,
        departmentId: newGrantDeptId || undefined,
        reason: newGrantReason || undefined,
      });
      setAccessGrants([...accessGrants, newGrant]);
    } else {
      // For new users, add to pending list
      setPendingAccessGrants([
        ...pendingAccessGrants,
        {
          tempId: `temp_${Date.now()}`,
          siteId: newGrantSiteId || undefined,
          departmentId: newGrantDeptId || undefined,
          reason: newGrantReason || undefined,
        }
      ]);
    }
    setNewGrantSiteId("");
    setNewGrantDeptId("");
    setNewGrantReason("");
  };

  // Handle removing access grant
  const handleRemoveAccessGrant = (grant: UserAccessGrant) => {
    deleteUserAccessGrant(grant.id);
    setAccessGrants(accessGrants.filter(g => g.id !== grant.id));
  };

  // Handle removing pending access grant
  const handleRemovePendingAccessGrant = (tempId: string) => {
    setPendingAccessGrants(pendingAccessGrants.filter(pag => pag.tempId !== tempId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      setActiveTab("basic");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      setActiveTab("basic");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      setActiveTab("basic");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setActiveTab("basic");
      return;
    }
    if (role === "MANAGER" && !siteId) {
      setError("Site is required for Manager role");
      setActiveTab("basic");
      return;
    }
    if (role === "LEARNER" && !managerId) {
      setError("Manager is required for Learner role");
      setActiveTab("basic");
      return;
    }

    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        jobTitleId: selectedJobTitleId || undefined,
        jobTitleText: useCustomTitle ? (jobTitle.trim() || undefined) : (selectedJobTitleId ? getJobTitleById(selectedJobTitleId)?.name : undefined),
        role,
        siteId: siteId || undefined,
        departmentId: departmentId || undefined,
        managerId: role === "LEARNER" ? managerId || undefined : undefined,
        active: true,
      };

      if (isEditing && editUser) {
        const oldJobTitleId = editUser.jobTitleId;
        updateUser(editUser.id, userData);

        // Check for role change gaps
        if (selectedJobTitleId && selectedJobTitleId !== oldJobTitleId) {
          const gaps = analyzeRoleChangeGaps(editUser.id, selectedJobTitleId);
          if (gaps.gapCount > 0) {
            const jt = getJobTitleById(selectedJobTitleId);
            setRoleChangeGap({
              userId: editUser.id,
              userName: getFullName(editUser),
              newJobTitle: jt?.name || selectedJobTitleId,
              existingSkills: gaps.existingSkills,
              missingSkills: gaps.missingSkills,
            });
            return;
          }
        }

        setToast({ message: "User updated successfully", type: "success" });
        setTimeout(() => {
          onClose();
          setToast(null);
        }, 1500);
      } else {
        // Create new user
        const newUser = createUser(userData);
        
        // Apply pending additional managers
        for (const pam of pendingAdditionalManagers) {
          addAdditionalManager(newUser.id, pam.managerId, pam.relationship);
        }
        
        // Apply pending access grants
        for (const pag of pendingAccessGrants) {
          createUserAccessGrant(newUser.id, currentUser.id, {
            siteId: pag.siteId,
            departmentId: pag.departmentId,
            reason: pag.reason,
          });
        }
        
        // Create onboarding assignment if applicable
        if (assignOnboarding && selectedJobTitleId && !isEditing) {
          const obPath = getOnboardingPathByJobTitleId(selectedJobTitleId);
          if (obPath) {
            createOnboardingAssignment({
              pathId: obPath.id,
              userId: newUser.id,
              status: "active",
              startDate: onboardingStartDate,
              phaseProgress: obPath.phases.map((ph, i) => ({
                phaseId: ph.id,
                status: i === 0 ? "in_progress" : "locked",
                coursesCompleted: 0,
                coursesTotal: ph.courses.length,
              })),
              skillsEarned: [],
              assignedByUserId: currentUser.id,
            });
          }
        }

        setNewlyCreatedUser(newUser);
        
        // Show training assignment modal for new learners
        if (role === "LEARNER") {
          setShowAssignTrainings(true);
        } else {
          setToast({ message: "User created successfully", type: "success" });
          setTimeout(() => {
            onClose();
            setToast(null);
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    }
  };

  const handleAssignTrainings = (courseAssignments: Array<{ courseId: string; dueAt: string }>) => {
    if (!newlyCreatedUser) return;

    // Assign courses to the new user (each with its own due date)
    const assignments = assignCoursesToUser(
      newlyCreatedUser.id,
      courseAssignments.map(a => a.courseId),
      currentUser.id,
      undefined, // No single dueAt - each assignment has its own
      courseAssignments // Pass per-course due dates
    );

    // Create welcome notification for the new user
    if (assignments.length > 0) {
      const now = new Date().toISOString();
      // Find the earliest due date for the notification
      const earliestDue = courseAssignments.reduce((min, a) => 
        !min || a.dueAt < min ? a.dueAt : min, ""
      );
      
      createNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sentAt: now,
        senderId: currentUser.id,
        audience: "SPECIFIC",
        subject: "Welcome! Your training has been assigned",
        body: `You have been assigned ${assignments.length} training course${assignments.length !== 1 ? 's' : ''}. ${earliestDue ? `Your first deadline is ${new Date(earliestDue).toLocaleDateString()}.` : 'Get started today!'}`,
        source: "Manual",
        status: "SENT",
        recipients: [{ 
          userId: newlyCreatedUser.id, 
          name: `${newlyCreatedUser.firstName} ${newlyCreatedUser.lastName}`,
          email: newlyCreatedUser.email 
        }],
      });

      // Notify the manager if applicable
      if (newlyCreatedUser.managerId) {
        const manager = getUser(newlyCreatedUser.managerId);
        if (manager) {
          createNotification({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            sentAt: now,
            senderId: currentUser.id,
            audience: "SPECIFIC",
            subject: "New team member onboarded",
            body: `${newlyCreatedUser.firstName} ${newlyCreatedUser.lastName} has been added to your team and assigned ${assignments.length} training course${assignments.length !== 1 ? 's' : ''}.`,
            source: "Manual",
            status: "SENT",
            recipients: [{ 
              userId: manager.id, 
              name: `${manager.firstName} ${manager.lastName}`,
              email: manager.email 
            }],
          });
        }
      }
    }

    setToast({ 
      message: `User created and ${assignments.length} course${assignments.length !== 1 ? 's' : ''} assigned`, 
      type: "success" 
    });
    setShowAssignTrainings(false);
    
    setTimeout(() => {
      onClose();
      setToast(null);
    }, 1500);
  };

  const handleSkipAssignment = () => {
    setShowAssignTrainings(false);
    setToast({ message: "User created successfully", type: "success" });
    
    setTimeout(() => {
      onClose();
      setToast(null);
    }, 1500);
  };

  const handleClose = () => {
    setError(null);
    setToast(null);
    setShowAssignTrainings(false);
    setNewlyCreatedUser(null);
    onClose();
  };

  const getRelationshipLabel = (rel: AccessGrantRelationship) => {
    switch (rel) {
      case "co-manager": return "Co-Manager";
      case "matrix": return "Matrix/Project";
      case "coverage": return "Coverage/Backup";
      case "mentor": return "Mentor";
    }
  };

  // Combined list of additional managers (real + pending) for display
  const displayAdditionalManagers = [
    ...additionalManagers.map(am => ({
      id: am.id,
      managerId: am.managerId,
      relationship: am.relationship,
      isPending: false,
    })),
    ...pendingAdditionalManagers.map(pam => ({
      id: pam.tempId,
      managerId: pam.managerId,
      relationship: pam.relationship,
      isPending: true,
    }))
  ];

  // Combined list of access grants (real + pending) for display
  const displayAccessGrants = [
    ...accessGrants.map(g => ({
      id: g.id,
      siteId: g.siteId,
      departmentId: g.departmentId,
      reason: g.reason,
      isPending: false,
    })),
    ...pendingAccessGrants.map(pag => ({
      id: pag.tempId,
      siteId: pag.siteId,
      departmentId: pag.departmentId,
      reason: pag.reason,
      isPending: true,
    }))
  ];

  return (
    <>
      <Modal isOpen={isOpen && !showAssignTrainings} onClose={handleClose} title={isEditing ? "Edit User" : "New User"}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Tabs - always visible */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hierarchy")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "hierarchy"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Managers
              {displayAdditionalManagers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {displayAdditionalManagers.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("access")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "access"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="w-4 h-4" />
              Access Grants
              {displayAccessGrants.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {displayAccessGrants.length}
                </span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  {useCustomTitle ? (
                    <>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Forklift Operator, Safety Coordinator"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomTitle(false);
                          setJobTitle("");
                        }}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select from structured job titles instead
                      </button>
                    </>
                  ) : (
                    <JobTitleDropdown
                      selectedId={selectedJobTitleId}
                      onSelect={(id) => {
                        setSelectedJobTitleId(id);
                        setJobTitle("");
                      }}
                      onCustom={() => {
                        setUseCustomTitle(true);
                        setSelectedJobTitleId("");
                      }}
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500">The employee&apos;s position or job function</p>

                  {/* Onboarding path card */}
                  {selectedJobTitleId && !isEditing && (() => {
                    const obPath = getOnboardingPathByJobTitleId(selectedJobTitleId);
                    if (!obPath) return null;
                    const startD = new Date(onboardingStartDate);
                    return (
                      <div className="mt-3 border border-emerald-200 bg-emerald-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                          🎓 Onboarding Path Available
                        </h4>
                        <p className="text-sm text-emerald-700 font-medium">{obPath.title}</p>
                        <div className="flex items-center gap-3 text-xs text-emerald-600 mt-1 mb-3">
                          <span>📅 {obPath.durationDays} days</span>
                          <span>📘 {obPath.phases.reduce((s, p) => s + p.courses.length, 0)} courses</span>
                          <span>🎯 {obPath.skillsCovered.length} skills</span>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={assignOnboarding}
                            onChange={(e) => setAssignOnboarding(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Assign this onboarding path to the new user
                        </label>
                        {assignOnboarding && (
                          <div className="mt-2">
                            <label className="text-xs text-gray-600 mb-1 block">Start date:</label>
                            <input
                              type="date"
                              value={onboardingStartDate}
                              onChange={(e) => setOnboardingStartDate(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                              <p className="font-medium text-gray-600">Phase due dates:</p>
                              {obPath.phases.map((ph, i) => {
                                const due = new Date(startD.getTime() + ph.dayEnd * 86400000);
                                return (
                                  <p key={ph.id}>
                                    Phase {i + 1} ({ph.timeline}): {due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {isAdmin && <option value="ADMIN">Admin</option>}
                    {isAdmin && <option value="MANAGER">Manager</option>}
                    <option value="LEARNER">Learner</option>
                  </select>
                  {!isAdmin && (
                    <p className="mt-1 text-xs text-gray-500">Managers can only create Learner users</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site {role === "MANAGER" && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => {
                      setSiteId(e.target.value);
                      // Reset department if it doesn't belong to new site
                      if (departmentId) {
                        const dept = departments.find(d => d.id === departmentId);
                        if (dept && dept.siteId !== e.target.value) {
                          setDepartmentId("");
                        }
                      }
                    }}
                    disabled={currentUser.role === "MANAGER"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select site...</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}{site.region && ` (${site.region})`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={currentUser.role === "MANAGER" || !siteId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select department...</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {role === "LEARNER" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Manager <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select manager...</option>
                      {availableManagers.map(mgr => {
                        const mgrSite = sites.find(s => s.id === mgr.siteId);
                        const mgrDept = departments.find(d => d.id === mgr.departmentId);
                        const locationLabel = mgrDept?.name || (mgrSite ? (mgrSite.region ? `${mgrSite.name} (${mgrSite.region})` : mgrSite.name) : "");
                        return (
                          <option key={mgr.id} value={mgr.id}>
                            {mgr.firstName} {mgr.lastName} ({locationLabel})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendInvite"
                      checked={sendInvite}
                      onChange={(e) => setSendInvite(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendInvite" className="text-sm text-gray-700">
                      Send invite email (mock - not functional)
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Additional Managers Tab */}
            {activeTab === "hierarchy" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Manager</h4>
                  {managerId ? (
                    <p className="text-sm text-gray-700">
                      {allUsers.find(u => u.id === managerId)?.firstName} {allUsers.find(u => u.id === managerId)?.lastName}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {role === "LEARNER" ? "Set in Basic Info tab" : "Not applicable for this role"}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Managers</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Add co-managers, matrix managers, or mentors who should have visibility into this employee&apos;s training.
                  </p>

                  {/* Current additional managers */}
                  {displayAdditionalManagers.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {displayAdditionalManagers.map(am => {
                        const manager = allUsers.find(u => u.id === am.managerId);
                        return (
                          <div key={am.id} className={`flex items-center justify-between p-2 bg-white border rounded-lg ${am.isPending ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {manager?.firstName} {manager?.lastName}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {getRelationshipLabel(am.relationship)}
                              </span>
                              {am.isPending && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                  Pending
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (am.isPending) {
                                  handleRemovePendingAdditionalManager(am.id);
                                } else {
                                  const realAm = additionalManagers.find(m => m.id === am.id);
                                  if (realAm) handleRemoveAdditionalManager(realAm);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new additional manager */}
                  <div className="flex gap-2">
                    <select
                      value={newAdditionalManagerId}
                      onChange={(e) => setNewAdditionalManagerId(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select manager...</option>
                      {availableAdditionalManagers.map(mgr => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.firstName} {mgr.lastName}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newAdditionalRelationship}
                      onChange={(e) => setNewAdditionalRelationship(e.target.value as AccessGrantRelationship)}
                      className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="co-manager">Co-Manager</option>
                      <option value="matrix">Matrix</option>
                      <option value="coverage">Coverage</option>
                      <option value="mentor">Mentor</option>
                    </select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddAdditionalManager}
                      disabled={!newAdditionalManagerId}
                      className="px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Access Grants Tab */}
            {activeTab === "access" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Access Grants</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Grant this user visibility into additional sites or departments beyond their normal scope. 
                    Useful for VPs, cross-functional managers, or coverage scenarios.
                  </p>

                  {/* Current access grants */}
                  {displayAccessGrants.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {displayAccessGrants.map(grant => {
                        const site = sites.find(s => s.id === grant.siteId);
                        const dept = departments.find(d => d.id === grant.departmentId);
                        return (
                          <div key={grant.id} className={`flex items-center justify-between p-2 bg-white border rounded-lg ${grant.isPending ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {site ? (site.region ? `${site.name} (${site.region})` : site.name) : ""}{site && dept ? " → " : ""}{dept ? dept.name : ""}
                              </span>
                              {grant.reason && (
                                <span className="ml-2 text-xs text-gray-500">({grant.reason})</span>
                              )}
                              {grant.isPending && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                  Pending
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (grant.isPending) {
                                  handleRemovePendingAccessGrant(grant.id);
                                } else {
                                  const realGrant = accessGrants.find(g => g.id === grant.id);
                                  if (realGrant) handleRemoveAccessGrant(realGrant);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new access grant */}
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newGrantSiteId}
                        onChange={(e) => {
                          setNewGrantSiteId(e.target.value);
                          setNewGrantDeptId(""); // Reset dept when site changes
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Site (optional)...</option>
                        {sites.map(site => (
                          <option key={site.id} value={site.id}>{site.name}{site.region && ` (${site.region})`}</option>
                        ))}
                      </select>
                      <select
                        value={newGrantDeptId}
                        onChange={(e) => setNewGrantDeptId(e.target.value)}
                        disabled={!newGrantSiteId}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Department (optional)...</option>
                        {departments.filter(d => d.siteId === newGrantSiteId).map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGrantReason}
                        onChange={(e) => setNewGrantReason(e.target.value)}
                        placeholder="Reason (optional)..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddAccessGrant}
                        disabled={!newGrantSiteId && !newGrantDeptId}
                        className="px-3"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Grant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Training Assignment Modal - shown after creating a new learner */}
      {showAssignTrainings && newlyCreatedUser && (
        <AssignTrainingsModal
          isOpen={showAssignTrainings}
          onClose={handleSkipAssignment}
          user={newlyCreatedUser}
          onAssign={handleAssignTrainings}
        />
      )}

      {/* Role Change Gap Modal */}
      {roleChangeGap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {generatingGapTraining ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-700 font-medium">Generating gap training...</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Role Change Gap Detected
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>{roleChangeGap.userName}</strong> is transitioning to{" "}
                  <strong>{roleChangeGap.newJobTitle}</strong>. They have{" "}
                  {roleChangeGap.existingSkills.length} of{" "}
                  {roleChangeGap.existingSkills.length + roleChangeGap.missingSkills.length} required
                  skills.
                </p>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    Gap training will cover:
                  </p>
                  <div className="space-y-1">
                    {roleChangeGap.missingSkills.map((sid) => {
                      const skill = getSkillV2ById(sid);
                      return (
                        <div key={sid} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded">
                          <Shield className="w-3.5 h-3.5 text-red-500" />
                          {skill?.name || sid}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {roleChangeGap.existingSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1.5">Already covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {roleChangeGap.existingSkills.map((sid) => {
                        const skill = getSkillV2ById(sid);
                        return (
                          <span key={sid} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                            {skill?.name || sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRoleChangeGap(null);
                      setToast({ message: "User updated. No gap training generated.", type: "info" });
                      setTimeout(() => { onClose(); setToast(null); }, 1500);
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      setGeneratingGapTraining(true);
                      try {
                        const result = await generateTrainingResponse({
                          type: "role_change_gap",
                          targetUserIds: [roleChangeGap.userId],
                          sourceIds: [],
                          affectedSkillIds: roleChangeGap.missingSkills,
                          generatedByUserId: currentUser.id,
                          triggerType: "role_change",
                          triggeredByRoleChangeUserId: roleChangeGap.userId,
                        });
                        createTrainingResponse(result);
                        setGeneratingGapTraining(false);
                        setRoleChangeGap(null);
                        setToast({ message: "User updated. Gap training created and ready for review.", type: "success" });
                        setTimeout(() => { onClose(); setToast(null); }, 2000);
                      } catch {
                        setGeneratingGapTraining(false);
                      }
                    }}
                  >
                    Generate Gap Training
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

/* ─── Job Title Searchable Dropdown ───────────────────────────────────── */

function JobTitleDropdown({
  selectedId,
  onSelect,
  onCustom,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onCustom: () => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const allJobTitles = getJobTitles().filter((jt) => jt.active);

  const selected = selectedId ? allJobTitles.find((jt) => jt.id === selectedId) : null;

  const filtered = useMemo(() => {
    if (!search) return allJobTitles;
    const q = search.toLowerCase();
    return allJobTitles.filter(
      (jt) =>
        jt.name.toLowerCase().includes(q) ||
        jt.department.toLowerCase().includes(q) ||
        jt.site.toLowerCase().includes(q)
    );
  }, [allJobTitles, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selected ? (
          <span className="text-gray-900">{selected.name}</span>
        ) : (
          <span className="text-gray-400">Select a job title...</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-64 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search job titles..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {selectedId && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect("");
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                >
                  Clear selection
                </button>
              )}
              {filtered.map((jt) => (
                <button
                  key={jt.id}
                  type="button"
                  onClick={() => {
                    onSelect(jt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2.5 text-left hover:bg-blue-50 ${
                    jt.id === selectedId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{jt.name}</div>
                  <div className="text-xs text-gray-500">
                    {jt.department} &bull; {jt.site} &bull; {jt.requiredSkills.length} required skill{jt.requiredSkills.length !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}

              {filtered.length === 0 && (
                <div className="px-3 py-3 text-sm text-gray-500 text-center">No matching job titles</div>
              )}
            </div>

            {/* Footer options */}
            <div className="border-t border-gray-100 p-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onCustom();
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                Or type a custom title
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
