"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Clock, Target, BookOpen, ArrowRight, Star } from "lucide-react";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import {
  getCertificatesByUserId,
  getProgressCourseByCourseAndUser,
  getProgressLesson,
  getLessonsByCourseId,
  getAssignedCoursesForUser,
  submitCourseFeedback,
  getUserCourseFeedback,
} from "@/lib/store";
import { Course } from "@/types";
import CertificateModal from "./certificates/CertificateModal";

interface CourseCompletionSummaryProps {
  course: Course;
  userId: string;
  scorePct?: number;
  onReturnToDashboard: () => void;
}

export default function CourseCompletionSummary({
  course,
  userId,
  scorePct,
  onReturnToDashboard,
}: CourseCompletionSummaryProps) {
  const [showCert, setShowCert] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const certificates = getCertificatesByUserId(userId);
  const cert = certificates.find((c) => c.courseId === course.id);
  const progress = getProgressCourseByCourseAndUser(course.id, userId);
  const lessons = getLessonsByCourseId(course.id);

  const totalTime = lessons.reduce((sum, l) => {
    const p = getProgressLesson(userId, l.id);
    return sum + (p?.timeSpentSec || 0);
  }, 0);
  const totalMinutes = Math.round(totalTime / 60);

  const skillsEarned = course.skillsGranted || [];

  // Check for existing feedback
  useEffect(() => {
    const existing = getUserCourseFeedback(course.id, userId);
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment || "");
      setFeedbackSubmitted(true);
    }
  }, [course.id, userId]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSubmitFeedback = () => {
    if (rating === 0) return;
    submitCourseFeedback(course.id, userId, rating, comment || undefined);
    setFeedbackSubmitted(true);
  };

  // Next recommended course
  const allCourses = getAssignedCoursesForUser(userId);
  const nextCourse = allCourses.find((c) => {
    if (c.id === course.id) return false;
    const p = getProgressCourseByCourseAndUser(c.id, userId);
    return !p || p.status !== "completed";
  });

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className={`max-w-2xl mx-auto px-6 py-12 transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Celebration header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
            <Award className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-lg text-gray-600">
            You&apos;ve completed <span className="font-semibold">{course.title}</span>
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {scorePct !== undefined && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{scorePct}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Score</p>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {totalMinutes > 0 ? `${totalMinutes}` : "<1"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Minutes Spent</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lessons</p>
          </div>
          {skillsEarned.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{skillsEarned.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Skills Earned</p>
            </div>
          )}
        </div>

        {/* Skills earned detail */}
        {skillsEarned.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-8">
            <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Skills Earned
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsEarned.map((s) => (
                <Badge key={s.skillId} variant="default" className="bg-purple-100 text-purple-700">
                  {s.skillId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certificate */}
        {cert && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Certificate Earned</p>
                <p className="text-xs text-gray-500">Serial: {cert.serial}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setShowCert(true)} className="text-sm">
              View Certificate
            </Button>
          </div>
        )}

        {/* Feedback */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {feedbackSubmitted ? "Thanks for your feedback!" : "How was this course?"}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => { if (!feedbackSubmitted) setRating(star); }}
                onMouseEnter={() => { if (!feedbackSubmitted) setHoverRating(star); }}
                onMouseLeave={() => setHoverRating(0)}
                disabled={feedbackSubmitted}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-500 ml-2">{rating}/5</span>
            )}
          </div>
          {!feedbackSubmitted && (
            <>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any additional comments? (optional)"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <Button
                variant="primary"
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className="text-sm"
              >
                Submit Feedback
              </Button>
            </>
          )}
        </div>

        {/* Next recommended */}
        {nextCourse && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Recommended Next</p>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{nextCourse.title}</h3>
            {nextCourse.category && (
              <p className="text-sm text-gray-500 mb-3">{nextCourse.category}</p>
            )}
            <Link
              href={`/learner/courses/${nextCourse.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Start Course <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center">
          <Link
            href="/learner"
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>

      {cert && (
        <CertificateModal
          isOpen={showCert}
          onClose={() => setShowCert(false)}
          certificates={[cert]}
        />
      )}
    </div>
  );
}
