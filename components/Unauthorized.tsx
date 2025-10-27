// Phase I Epic 1: Unauthorized access component
"use client";

import React from "react";
import Link from "next/link";
import Button from "./Button";
import Card from "./Card";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <Link href="/learner">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </Card>
    </div>
  );
}

