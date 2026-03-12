"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StyleGuideRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/learningmodel?tab=content-standards");
  }, [router]);
  return null;
}
