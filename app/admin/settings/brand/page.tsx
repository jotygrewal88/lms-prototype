"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BrandRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/settings/customization?tab=brand");
  }, [router]);
  return null;
}
