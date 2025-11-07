"use client";

import React from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

interface CertificatesMiniCardProps {
  count: number;
  onViewAll: () => void;
}

export default function CertificatesMiniCard({ count, onViewAll }: CertificatesMiniCardProps) {
  const [showToast, setShowToast] = React.useState(false);

  const handleViewAll = () => {
    setShowToast(true);
    onViewAll();
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Certificates Earned
            </h3>
            <p className="text-2xl font-bold text-[#2563EB]">{count}</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleViewAll}
            className="text-xs"
          >
            View all
          </Button>
        </div>
      </Card>
      {showToast && (
        <Toast
          message="Feature coming soon"
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

