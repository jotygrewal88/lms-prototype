// Phase II — 1M.1: Skills Tagging - Learner Profile / Skill Passport
// Phase II — 1M.2: PDF Export functionality
"use client";

import React, { useState, useEffect, useRef } from "react";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getCurrentUser, getEarnedSkillsByUser, subscribe, getOrganization, getSites, getDepartments, getProgressCoursesByUserId, getCertificatesByUserId, getCompletionsByUserId } from "@/lib/store";
import { Award, Download, BookOpen, Stamp, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SkillStamp from "@/components/learner/SkillStamp";

export default function LearnerProfilePage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [earnedSkills, setEarnedSkills] = useState(getEarnedSkillsByUser(currentUser.id));
  const organization = getOrganization();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const updateState = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setEarnedSkills(getEarnedSkillsByUser(user.id));
    };
    
    updateState();
    const unsubscribe = subscribe(updateState);
    return unsubscribe;
  }, []);

  // Helper to get earliest completion date for a skill from a course
  const getSkillEarnedDate = (skillId: string, courseId: string): string | null => {
    const userId = currentUser.id;
    
    // Check ProgressCourse
    const progress = getProgressCoursesByUserId(userId).find(
      p => p.courseId === courseId && p.status === "completed"
    );
    if (progress?.completedAt) return progress.completedAt;
    
    // Check Certificate
    const certificate = getCertificatesByUserId(userId).find(c => c.courseId === courseId);
    if (certificate?.issuedAt) return certificate.issuedAt;
    
    // Check TrainingCompletion
    const completions = getCompletionsByUserId(userId);
    const trainingCompletion = completions.find(
      c => c.courseId === courseId && c.status === "COMPLETED" && c.completedAt
    );
    if (trainingCompletion?.completedAt) return trainingCompletion.completedAt;
    
    return null;
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Capture the PDF container
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions (A4: 595.28 x 841.89 points at 72 DPI)
      const pdfWidth = 595.28;
      const pdfHeight = 841.89;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      
      // Add image with pagination
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Paginate if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Generate filename
      const firstName = currentUser.firstName || 'User';
      const lastName = currentUser.lastName || '';
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `Skill_Passport_${firstName}_${lastName}_${dateStr}.pdf`;
      
      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const primaryColor = organization.primaryColor || "#2563EB";
  
  // Category color mapping for stamps (also used in PDF)
  const categoryColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    Safety: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-700",
      icon: "text-red-600",
    },
    Equipment: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    Compliance: {
      bg: "bg-purple-50",
      border: "border-purple-400",
      text: "text-purple-700",
      icon: "text-purple-600",
    },
    Emergency: {
      bg: "bg-orange-50",
      border: "border-orange-400",
      text: "text-orange-700",
      icon: "text-orange-600",
    },
    Other: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-700",
      icon: "text-green-600",
    },
  };
  
  // Get site and department names
  const sites = getSites();
  const departments = getDepartments();
  const siteName = currentUser.siteId ? sites.find(s => s.id === currentUser.siteId)?.name : null;
  const deptName = currentUser.departmentId ? departments.find(d => d.id === currentUser.departmentId)?.name : null;
  
  // Group skills by category
  const skillsByCategory = earnedSkills.reduce((acc, { skill, courses }) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ skill, courses });
    return acc;
  }, {} as Record<string, Array<{ skill: typeof earnedSkills[0]['skill']; courses: typeof earnedSkills[0]['courses'] }>>);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <RouteGuard>
      <LearnerLayout>
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-sm text-gray-500">
              View your earned skills and learning achievements
            </p>
          </div>

          {/* Skill Passport Section - Premium Passport Style */}
          <Card className="overflow-hidden p-0 shadow-2xl border-0">
            {/* Premium Passport Header - Navy Blue */}
            <div 
              className="relative px-6 py-5 overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
                  linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1e3a8a 50%, #1e40af 75%, #1e3a8a 100%)
                `,
                borderBottom: '3px solid #1e293b',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Decorative border pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.15) 2px, rgba(255, 255, 255, 0.15) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)
                `,
                backgroundSize: '20px 20px',
              }}></div>
              
              {/* Emblem/Seal */}
              <div className="absolute top-2 right-4 opacity-15">
                <div className="w-20 h-20 rounded-full border-4 border-white/30" style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-white/20"></div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Premium Stamp Icon */}
                  <div 
                    className="relative p-3 rounded-full shadow-lg"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                    }}
                  >
                    <Stamp className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  </div>
                  
                  <div>
                    {/* Embossed title effect */}
                    <h2 
                      className="text-2xl font-bold mb-1 relative"
                      style={{ 
                        fontFamily: 'serif',
                        color: '#ffffff',
                        textShadow: `
                          0 1px 0 rgba(255,255,255,0.3),
                          0 2px 2px rgba(0,0,0,0.4),
                          0 4px 4px rgba(0,0,0,0.3),
                          inset 0 -1px 0 rgba(0,0,0,0.3)
                        `,
                        letterSpacing: '0.05em',
                      }}
                    >
                      SKILL PASSPORT
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                      <p className="text-xs text-blue-100 font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-1.5 bg-white/95 hover:bg-white border-2 border-white/50 text-xs px-4 py-2 shadow-lg backdrop-blur-sm"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {isGeneratingPDF ? "Generating..." : "Export PDF"}
                </Button>
              </div>
            </div>

            {/* Premium Passport Content with Texture - Cool Blue/Gray */}
            <div 
              className="relative p-5 overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 10% 20%, rgba(241, 245, 249, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 90% 80%, rgba(226, 232, 240, 0.5) 0%, transparent 50%),
                  linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%',
              }}
            >
              {/* Subtle watermark pattern */}
              <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e40af' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '40px 40px',
                }}
              ></div>

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 opacity-10">
                <div className="absolute top-2 left-2 w-12 h-12 border-2 border-dashed" style={{ borderColor: '#64748b', borderRadius: '4px' }}></div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                <div className="absolute top-2 right-2 w-12 h-12 border-2 border-dashed" style={{ borderColor: '#64748b', borderRadius: '4px' }}></div>
              </div>

              {/* Skills Stamps */}
              {earnedSkills.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-block bg-white/90 border-2 border-dashed border-blue-400 rounded-lg p-6">
                    <Stamp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
                      No Stamps Yet
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Complete courses to earn skill stamps and build your passport collection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, items]) => (
                    <div key={category}>
                      {/* Compact Category Header */}
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: '#64748b' }}></div>
                        <div className="bg-white/90 border border-blue-600 rounded-full px-3 py-1">
                          <h3 
                            className="text-xs font-bold uppercase tracking-wider text-gray-800"
                            style={{ fontFamily: 'serif' }}
                          >
                            {category}
                          </h3>
                        </div>
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: '#d4a574' }}></div>
                      </div>

                      {/* Compact Stamps Grid - Dense layout for scalability */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {items.map(({ skill, courses }) => {
                          // Get earliest completion date for this skill
                          const completionDates = courses
                            .map(course => getSkillEarnedDate(skill.id, course.id))
                            .filter((date): date is string => date !== null)
                            .sort();
                          const earliestDate = completionDates[0];

                          return (
                            <SkillStamp
                              key={skill.id}
                              skill={skill}
                              courses={courses}
                              earnedDate={earliestDate || undefined}
                              primaryColor={primaryColor}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Premium Footer */}
              <div className="mt-6 pt-4 border-t-2 border-dashed relative" style={{ borderColor: '#64748b' }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-50"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-50"></div>
                <p className="text-xs text-gray-600 text-center font-medium relative z-10">
                  <span className="inline-block px-2 py-1 bg-white/80 rounded border border-blue-200/50">
                    Issued by <span className="font-bold" style={{ color: '#1e40af' }}>{organization.name}</span> • {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Hidden PDF Container - Compact Passport Style */}
          <div 
            ref={pdfRef} 
            className="fixed -left-[9999px] top-0 w-[8.5in] p-8" 
            style={{ 
              width: '8.5in',
              background: 'linear-gradient(180deg, #fef9f3 0%, #faf5e6 100%)',
            }}
          >
            {/* Compact Passport Header */}
            <div 
              className="mb-6 pb-4 border-b-2"
              style={{
                borderColor: '#d4a574',
                background: 'linear-gradient(180deg, #d4a574 0%, #c49a5f 100%)',
                padding: '1rem',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <div className="flex items-center justify-between">
                {organization.logo && (
                  <img 
                    src={organization.logo} 
                    alt={organization.name}
                    className="h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 ml-4">
                  <h1 
                    className="text-2xl font-bold text-white mb-0.5"
                    style={{ fontFamily: 'serif', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    SKILL PASSPORT
                  </h1>
                  <h2 className="text-sm text-yellow-100">
                    {currentUser.firstName} {currentUser.lastName}
                  </h2>
                </div>
              </div>
            </div>

            {/* Compact Passport Content */}
            <div 
              className="p-4"
              style={{
                background: 'linear-gradient(180deg, #fef9f3 0%, #faf5e6 100%)',
              }}
            >
              {/* Skills by Category */}
              {earnedSkills.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-block bg-white/80 border-2 border-dashed border-amber-400 rounded-lg p-6">
                    <Stamp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'serif' }}>
                      No Stamps Yet
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Complete courses to earn skill stamps and build your passport collection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, items]) => (
                    <div key={category}>
                      {/* Compact Category Header */}
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: '#64748b' }}></div>
                        <div className="bg-white/90 border border-blue-600 rounded-full px-3 py-1">
                          <h3 
                            className="text-xs font-bold uppercase tracking-wider text-gray-800"
                            style={{ fontFamily: 'serif' }}
                          >
                            {category}
                          </h3>
                        </div>
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: '#d4a574' }}></div>
                      </div>

                      {/* Compact Stamps Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {items.map(({ skill, courses }) => {
                          // Get earliest completion date for this skill
                          const completionDates = courses
                            .map(course => getSkillEarnedDate(skill.id, course.id))
                            .filter((date): date is string => date !== null)
                            .sort();
                          const earliestDate = completionDates[0];
                          
                          const categoryColor = categoryColors[category] || categoryColors.Other;
                          
                          return (
                            <div
                              key={skill.id}
                              className={`p-3 rounded-lg border-2 ${categoryColor.border} ${categoryColor.bg} bg-white/80`}
                            >
                              <div className="mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase ${categoryColor.border} ${categoryColor.text} border-2`}>
                                  {category}
                                </span>
                              </div>
                              <h4 className={`text-base font-bold mb-2 ${categoryColor.text}`} style={{ fontFamily: 'serif' }}>
                                {skill.name}
                              </h4>
                              {earliestDate && (
                                <div className={`flex items-center gap-1.5 mb-2 py-1 px-2 rounded bg-white/60 border ${categoryColor.border}`}>
                                  <Calendar className={`w-3 h-3 ${categoryColor.icon}`} />
                                  <span className={`text-xs font-semibold ${categoryColor.text}`}>
                                    {formatDate(earliestDate)}
                                  </span>
                                </div>
                              )}
                              <div className={`mt-2 pt-2 border-t border-dashed ${categoryColor.border}`}>
                                <p className={`text-xs font-semibold uppercase mb-1 ${categoryColor.text}`}>Via:</p>
                                <div className="space-y-1">
                                  {courses.map((course) => (
                                    <div key={course.id} className={`flex items-center gap-1.5 text-xs ${categoryColor.text}`}>
                                      <BookOpen className={`w-3 h-3 ${categoryColor.icon}`} />
                                      <span>{course.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Compact Footer */}
              <div className="mt-6 pt-4 border-t border-dashed" style={{ borderColor: '#d4a574' }}>
                <p className="text-xs text-gray-500 text-center">
                  Issued by <span className="font-semibold">{organization.name}</span> • {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </LearnerLayout>
    </RouteGuard>
  );
}

