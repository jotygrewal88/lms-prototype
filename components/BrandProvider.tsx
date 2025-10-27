// Phase I Epic 1: Brand color provider for dynamic theming
"use client";

import React, { useEffect, useState } from "react";
import { getOrganization, subscribe } from "@/lib/store";

interface BrandProviderProps {
  children: React.ReactNode;
}

export default function BrandProvider({ children }: BrandProviderProps) {
  const [primaryColor, setPrimaryColor] = useState(getOrganization().primaryColor);

  useEffect(() => {
    // Set initial color
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    // Subscribe to changes
    const unsubscribe = subscribe(() => {
      const org = getOrganization();
      setPrimaryColor(org.primaryColor);
      document.documentElement.style.setProperty('--primary-color', org.primaryColor);
    });

    return unsubscribe;
  }, [primaryColor]);

  return <>{children}</>;
}

