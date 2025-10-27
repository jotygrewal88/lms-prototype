// Health check page - verifies app is running and styled correctly
"use client";

import Card from "@/components/Card";
import Button from "@/components/Button";

export default function HealthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-green-600">✓ OK</h1>
          <p className="text-sm text-gray-600">
            UpKeep LMS is running successfully.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => window.location.href = "/"}>
              Go to App
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

