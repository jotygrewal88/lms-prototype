"use client";

import React, { useState, useEffect } from "react";
import LearnerLayout from "@/components/layouts/LearnerLayout";
import RouteGuard from "@/components/RouteGuard";
import CertificateModal from "@/components/learner/certificates/CertificateModal";
import {
  getCurrentUser,
  getCertificatesByUserId,
  getCourseById,
  subscribe,
} from "@/lib/store";
import { Certificate } from "@/types";
import { 
  Award,
  Calendar,
  Download,
  Eye,
  Clock,
  AlertTriangle,
  FileText
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      const certs = getCertificatesByUserId(user.id);
      // Sort by issue date (most recent first)
      certs.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      setCertificates(certs);
    };

    loadData();
    const unsubscribe = subscribe(loadData);
    return unsubscribe;
  }, []);

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsModalOpen(true);
  };

  // Check if certificate is expiring soon (within 30 days)
  const isExpiringSoon = (cert: Certificate) => {
    if (!cert.expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(cert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  // Check if certificate is expired
  const isExpired = (cert: Certificate) => {
    if (!cert.expiresAt) return false;
    return new Date(cert.expiresAt).getTime() < Date.now();
  };

  // Get counts
  const validCount = certificates.filter(c => !isExpired(c)).length;
  const expiringSoonCount = certificates.filter(c => isExpiringSoon(c)).length;
  const expiredCount = certificates.filter(c => isExpired(c)).length;

  return (
    <RouteGuard allowedRoles={["LEARNER"]}>
      <LearnerLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
            </div>
            <p className="text-gray-600">
              Certificates you've earned from completing courses. Download or share your achievements.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  <p className="text-xs text-gray-500">Total Earned</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{validCount}</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
              </div>
            </div>
            {expiringSoonCount > 0 && (
              <div className="bg-white rounded-xl border border-amber-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{expiringSoonCount}</p>
                    <p className="text-xs text-gray-500">Expiring Soon</p>
                  </div>
                </div>
              </div>
            )}
            {expiredCount > 0 && (
              <div className="bg-white rounded-xl border border-red-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
                    <p className="text-xs text-gray-500">Expired</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Complete courses to earn certificates. They'll appear here once you finish your training.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {certificates.map((cert) => {
                const course = getCourseById(cert.courseId);
                const expired = isExpired(cert);
                const expiringSoon = isExpiringSoon(cert);

                return (
                  <div
                    key={cert.id}
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                      expired ? "border-red-200" : expiringSoon ? "border-amber-200" : "border-gray-200"
                    }`}
                  >
                    {/* Certificate preview banner */}
                    <div className={`relative h-32 ${
                      expired 
                        ? "bg-gradient-to-br from-gray-200 to-gray-300" 
                        : "bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100"
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          expired ? "bg-gray-300" : "bg-white/80"
                        } shadow-lg`}>
                          <Award className={`w-8 h-8 ${expired ? "text-gray-500" : "text-amber-600"}`} />
                        </div>
                      </div>
                      {/* Status badge */}
                      {expired && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Expired
                        </div>
                      )}
                      {expiringSoon && !expired && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Expiring Soon
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {cert.courseTitle || course?.title || "Course Certificate"}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mb-3">
                        Serial: {cert.serial}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Issued: {formatDate(cert.issuedAt)}</span>
                        </div>
                        {cert.expiresAt && (
                          <div className={`flex items-center gap-2 text-sm ${
                            expired ? "text-red-600" : expiringSoon ? "text-amber-600" : "text-gray-600"
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              {expired ? "Expired" : "Expires"}: {formatDate(cert.expiresAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCertificate(null);
          }}
          certificates={selectedCertificate ? [selectedCertificate] : []}
        />
      </LearnerLayout>
    </RouteGuard>
  );
}


