"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CertificatesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/settings/customization?tab=certificates");
  }, [router]);
  return null;
}
