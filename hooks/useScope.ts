"use client";

import { useState, useEffect } from "react";
import { getScope, setScope as storeSetScope, subscribe, type Scope } from "@/lib/store";

export function useScope() {
  const [scope, setScopeState] = useState<Scope>(getScope());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setScopeState(getScope());
    });
    return unsubscribe;
  }, []);

  const setScope = (newScope: Scope) => {
    storeSetScope(newScope);
  };

  const resetScope = () => {
    storeSetScope({ siteId: "ALL", deptId: "ALL" });
  };

  return { scope, setScope, resetScope };
}

