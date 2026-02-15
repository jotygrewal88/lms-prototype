"use client";

import { useState } from "react";
import type { GeneratedLesson } from "@/types";
import { markdownToHtml } from "@/lib/markdownToHtml";
import { ChevronDown, ChevronRight, BookOpen, FileText, HelpCircle } from "lucide-react";

interface CourseOutlineCardProps {
  lessons: GeneratedLesson[];
}

export default function CourseOutlineCard({ lessons }: CourseOutlineCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  const quizCount = lessons.filter((l) => l.quizQuestions && l.quizQuestions.length > 0).length;

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-orange-500" />;
      case "video":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="border border-purple-200 rounded-xl bg-purple-50/50 overflow-hidden mt-3">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-100/60 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">
              Generated Course Outline
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-purple-600">
            <span>{lessons.length} lessons</span>
            <span>~{totalDuration} min</span>
            {quizCount > 0 && <span>{quizCount} quizzes</span>}
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="divide-y divide-purple-100">
        {lessons.map((lesson, index) => (
          <div key={index}>
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
            >
              {expandedIndex === index ? (
                <ChevronDown className="w-4 h-4 text-purple-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-xs text-gray-400 font-mono w-5">
                {String(index + 1).padStart(2, "0")}
              </span>
              {contentTypeIcon(lesson.contentType)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {lesson.title}
                </div>
                <div className="text-xs text-gray-500">{lesson.description}</div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                ~{lesson.duration} min
              </span>
            </button>

            {expandedIndex === index && (
              <div className="px-4 pb-4 pl-16">
                {/* Content preview */}
                <div
                  className="prose prose-sm max-w-none text-gray-700 bg-white rounded-lg p-4 border border-gray-100"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(lesson.content),
                  }}
                />

                {/* Quiz questions */}
                {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quiz Questions ({lesson.quizQuestions.length})
                    </p>
                    {lesson.quizQuestions.map((q, qi) => (
                      <div
                        key={qi}
                        className="bg-white rounded-lg p-3 border border-gray-100 text-sm"
                      >
                        <p className="font-medium text-gray-700 mb-1">
                          Q{qi + 1}: {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {q.options.map((opt, oi) => (
                            <span
                              key={oi}
                              className={`px-2 py-1 rounded ${
                                oi === q.correctIndex
                                  ? "bg-green-50 text-green-700 font-medium"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills addressed */}
                {lesson.skillsAddressed && lesson.skillsAddressed.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-gray-500">Skills:</span>
                    {lesson.skillsAddressed.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
