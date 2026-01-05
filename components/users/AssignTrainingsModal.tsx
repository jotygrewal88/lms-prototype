// New User Training Assignment Modal
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { 
  Book, 
  Clock, 
  Building2, 
  Users, 
  CheckCircle2, 
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { Course, User } from "@/types";
import { 
  getCourses, 
  getSites, 
  getDepartments
} from "@/lib/store";

interface AssignTrainingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAssign: (assignments: Array<{ courseId: string; dueAt: string }>) => void;
}

interface CourseWithDue {
  course: Course;
  dueAt: string;
  isRequired: boolean;
}

export default function AssignTrainingsModal({ 
  isOpen, 
  onClose, 
  user,
  onAssign 
}: AssignTrainingsModalProps) {
  // Map courseId -> due date
  const [selectedCourses, setSelectedCourses] = useState<Map<string, string>>(new Map());
  const [filterSiteId, setFilterSiteId] = useState<string>("");
  const [filterDeptId, setFilterDeptId] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "company-wide": true,
    "site": true,
    "department": true,
    "other": false
  });

  const sites = getSites();
  const departments = getDepartments();
  const allCourses = getCourses().filter(c => c.status === "published");

  // Default due date: 2 weeks from today
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  // Get user's site and department names
  const userSite = sites.find(s => s.id === user.siteId);
  const userDept = departments.find(d => d.id === user.departmentId);

  // Categorize courses by scope
  const courseGroups = useMemo(() => {
    const companyWide: Course[] = [];
    const siteSpecific: Course[] = [];
    const deptSpecific: Course[] = [];
    const other: Course[] = [];

    allCourses.forEach(course => {
      const scope = course.scope;
      
      if (!scope || scope.type === "custom") {
        other.push(course);
      } else if (scope.type === "company-wide") {
        companyWide.push(course);
      } else if (scope.type === "site") {
        // Check if user's site matches
        if (user.siteId && scope.siteIds?.includes(user.siteId)) {
          siteSpecific.push(course);
        } else {
          other.push(course);
        }
      } else if (scope.type === "department") {
        // Check if user's department matches
        if (user.departmentId && scope.departmentIds?.includes(user.departmentId)) {
          deptSpecific.push(course);
        } else {
          other.push(course);
        }
      }
    });

    return {
      companyWide,
      siteSpecific,
      deptSpecific,
      other
    };
  }, [allCourses, user.siteId, user.departmentId]);

  // Track if we've initialized the selection for this modal open
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-select company-wide courses on open
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const defaultDue = getDefaultDueDate();
      const initialSelection = new Map<string, string>();
      
      // Auto-select company-wide courses (required)
      courseGroups.companyWide.forEach(c => {
        initialSelection.set(c.id, defaultDue);
      });
      
      setSelectedCourses(initialSelection);
      setExpandedGroups({
        "company-wide": true,
        "site": true,
        "department": true,
        "other": false
      });
      setIsInitialized(true);
    } else if (!isOpen && isInitialized) {
      // Reset when modal closes
      setIsInitialized(false);
    }
  }, [isOpen, isInitialized, courseGroups.companyWide]);

  // Filter other courses based on selected filters
  const filteredOtherCourses = useMemo(() => {
    let filtered = courseGroups.other;
    
    if (filterSiteId) {
      filtered = filtered.filter(course => {
        if (course.scope?.type === "site") {
          return course.scope.siteIds?.includes(filterSiteId);
        }
        return true;
      });
    }
    
    if (filterDeptId) {
      filtered = filtered.filter(course => {
        if (course.scope?.type === "department") {
          return course.scope.departmentIds?.includes(filterDeptId);
        }
        return true;
      });
    }
    
    return filtered;
  }, [courseGroups.other, filterSiteId, filterDeptId]);

  const toggleCourse = (courseId: string, isRequired: boolean) => {
    if (isRequired) return; // Can't deselect required courses
    
    setSelectedCourses(prev => {
      const newMap = new Map(prev);
      if (newMap.has(courseId)) {
        newMap.delete(courseId);
      } else {
        newMap.set(courseId, getDefaultDueDate());
      }
      return newMap;
    });
  };

  const updateCourseDueDate = (courseId: string, dueAt: string) => {
    setSelectedCourses(prev => {
      const newMap = new Map(prev);
      if (newMap.has(courseId)) {
        newMap.set(courseId, dueAt);
      }
      return newMap;
    });
  };

  const selectAllInGroup = (courses: Course[]) => {
    const defaultDue = getDefaultDueDate();
    setSelectedCourses(prev => {
      const newMap = new Map(prev);
      courses.forEach(c => {
        if (!newMap.has(c.id)) {
          newMap.set(c.id, defaultDue);
        }
      });
      return newMap;
    });
  };

  const deselectAllInGroup = (courses: Course[], requiredIds: Set<string>) => {
    setSelectedCourses(prev => {
      const newMap = new Map(prev);
      courses.forEach(c => {
        if (!requiredIds.has(c.id)) {
          newMap.delete(c.id);
        }
      });
      return newMap;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleAssign = () => {
    const assignments = Array.from(selectedCourses.entries()).map(([courseId, dueAt]) => ({
      courseId,
      dueAt
    }));
    onAssign(assignments);
    onClose();
  };

  const requiredCount = courseGroups.companyWide.length;
  const optionalCount = selectedCourses.size - requiredCount;
  const requiredIds = new Set(courseGroups.companyWide.map(c => c.id));

  const renderCourseCard = (course: Course, isRequired: boolean) => {
    const isSelected = selectedCourses.has(course.id);
    const dueAt = selectedCourses.get(course.id) || getDefaultDueDate();
    
    return (
      <div
        key={course.id}
        className={`rounded-lg border-2 transition-all ${
          isSelected
            ? isRequired 
              ? 'border-teal-500 bg-teal-50'
              : 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div
          onClick={() => toggleCourse(course.id, isRequired)}
          className={`flex items-start gap-3 p-3 ${isRequired ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {isSelected ? (
              <CheckCircle2 className={`w-5 h-5 ${isRequired ? 'text-teal-600' : 'text-blue-600'}`} />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
              {isRequired && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-700 rounded-full">
                  Required
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {course.category && (
                <span className="flex items-center gap-1">
                  <Book className="w-3 h-3" />
                  {course.category}
                </span>
              )}
              {course.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.estimatedMinutes} min
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Per-course due date */}
        {isSelected && (
          <div className="px-3 pb-3 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Due:</span>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => updateCourseDueDate(course.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGroupSection = (
    key: string,
    title: string,
    description: string,
    courses: Course[],
    isRequired: boolean = false,
    icon: React.ReactNode
  ) => {
    if (courses.length === 0) return null;
    
    const isExpanded = expandedGroups[key];
    const selectedInGroup = courses.filter(c => selectedCourses.has(c.id)).length;
    
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleGroup(key)}
          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
            isRequired ? 'bg-teal-50' : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRequired ? 'bg-teal-100' : 'bg-white border border-gray-200'}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  isRequired ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {selectedInGroup}/{courses.length} selected
                </span>
              </div>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            {!isRequired && courses.length > 1 && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllInGroup(courses);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deselectAllInGroup(courses, requiredIds);
                  }}
                  className="text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  Deselect All
                </button>
              </div>
            )}
            <div className="space-y-2">
              {courses.map(course => renderCourseCard(course, isRequired))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Assign Trainings to {user.firstName}
              </h2>
              <p className="text-sm text-gray-600">
                Select the courses this new employee should complete
                {userSite && <span className="ml-1">• {userSite.name}</span>}
                {userDept && <span className="ml-1">• {userDept.name}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Company-wide Required */}
          {renderGroupSection(
            "company-wide",
            "Company-Wide Training",
            "Required for all employees - automatically assigned",
            courseGroups.companyWide,
            true,
            <Building2 className="w-5 h-5 text-teal-600" />
          )}

          {/* Site-specific */}
          {renderGroupSection(
            "site",
            `${userSite?.name || 'Site'} Training`,
            "Recommended training for this site",
            courseGroups.siteSpecific,
            false,
            <Building2 className="w-5 h-5 text-blue-600" />
          )}

          {/* Department-specific */}
          {renderGroupSection(
            "department",
            `${userDept?.name || 'Department'} Training`,
            "Recommended training for this department",
            courseGroups.deptSpecific,
            false,
            <Users className="w-5 h-5 text-purple-600" />
          )}

          {/* Other available courses */}
          {filteredOtherCourses.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleGroup("other")}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-gray-200 rounded-lg">
                    <Book className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">Other Available Courses</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                        {filteredOtherCourses.filter(c => selectedCourses.has(c.id)).length}/{filteredOtherCourses.length} selected
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Additional courses you can assign</p>
                  </div>
                </div>
                {expandedGroups["other"] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedGroups["other"] && (
                <div className="p-4 bg-white border-t border-gray-200">
                  {/* Filters */}
                  <div className="flex gap-3 mb-3">
                    <select
                      value={filterSiteId}
                      onChange={(e) => setFilterSiteId(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Sites</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                    <select
                      value={filterDeptId}
                      onChange={(e) => setFilterDeptId(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInGroup(filteredOtherCourses);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deselectAllInGroup(filteredOtherCourses, requiredIds);
                      }}
                      className="text-xs font-medium text-gray-600 hover:text-gray-800"
                    >
                      Deselect All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredOtherCourses.map(course => renderCourseCard(course, false))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {allCourses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No published courses available</p>
              <p className="text-sm">Create and publish courses to assign them to users</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedCourses.size}</span> courses selected
              {requiredCount > 0 && (
                <span className="text-teal-600 ml-1">({Math.min(requiredCount, selectedCourses.size)} required)</span>
              )}
              {optionalCount > 0 && (
                <span className="text-blue-600 ml-1">(+{optionalCount} optional)</span>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Skip for Now
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAssign}
                disabled={selectedCourses.size === 0}
              >
                Assign {selectedCourses.size} Course{selectedCourses.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
