// Phase I Epic 1: Brand settings page
// ✅ Acceptance: Admin can change brand color; updates apply immediately to buttons/nav
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { getOrganization, updateBrandSettings, subscribe } from "@/lib/store";

export default function BrandSettingsPage() {
  const [organization, setOrganization] = useState(getOrganization());
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor);
  const [logo, setLogo] = useState(organization.logo);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const org = getOrganization();
      setOrganization(org);
      setPrimaryColor(org.primaryColor);
      setLogo(org.logo);
    });
    return unsubscribe;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandSettings(primaryColor, logo);
    
    // Apply the color to CSS variable for immediate effect
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setPrimaryColor("#2563EB");
    setLogo("https://via.placeholder.com/150x50/2563EB/FFFFFF?text=UpKeep");
  };

  return (
    <RouteGuard>
      <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Brand Settings</h1>

        <Card className="max-w-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#2563EB"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This color will be applied to buttons, links, and other primary UI elements.
              </p>
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="text"
                id="logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a URL for your organization&apos;s logo. It will appear in the header.
              </p>
            </div>

            {logo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Preview
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img src={logo} alt="Logo preview" className="h-12 object-contain" />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Reset to Default
              </Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Settings saved successfully
                </span>
              )}
            </div>
          </form>
        </Card>
      </div>
      </AdminLayout>
    </RouteGuard>
  );
}

