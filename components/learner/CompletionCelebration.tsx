"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CompletionCelebrationProps {
  courseTitle: string;
  skillName?: string;
  scorePct?: number;
  onViewCertificate?: () => void;
  onReturnToDashboard?: () => void;
}

export default function CompletionCelebration({
  courseTitle,
  skillName,
  scorePct,
  onViewCertificate,
  onReturnToDashboard,
}: CompletionCelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    // Stagger the content appearance
    const timer = setTimeout(() => setShowContent(true), 300);
    // Fade out particles after a few seconds
    const particleTimer = setTimeout(() => setShowParticles(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(particleTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-sm">
      {/* Animated particles/confetti */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c'][i % 6],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      <div className={`text-center max-w-lg mx-auto px-8 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Trophy/celebration icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-400/20 mb-4">
            <span className="text-6xl">🎉</span>
          </div>
        </div>

        {/* Main text */}
        <h1 className="text-4xl font-bold text-white mb-3">
          Congratulations!
        </h1>
        <p className="text-xl text-purple-200 mb-2">
          You&apos;ve completed
        </p>
        <p className="text-2xl font-semibold text-white mb-6">
          {courseTitle}
        </p>

        {/* Score (if quiz was passed) */}
        {scorePct !== undefined && (
          <div className="inline-flex items-center gap-3 bg-white/10 rounded-xl px-6 py-3 mb-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-400">{scorePct}%</div>
            <div className="text-left">
              <div className="text-sm text-green-300 font-medium">Assessment Passed</div>
              <div className="text-xs text-purple-300">Great job!</div>
            </div>
          </div>
        )}

        {/* Skill earned */}
        {skillName && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2.5 backdrop-blur-sm">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-white">Skill Earned: </span>
              <span className="text-sm font-bold text-yellow-300">{skillName}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {onViewCertificate && (
            <button
              onClick={onViewCertificate}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-900 font-semibold rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
            >
              <span>📜</span>
              View Certificate
            </button>
          )}
          <Link
            href="/learner"
            onClick={onReturnToDashboard}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
