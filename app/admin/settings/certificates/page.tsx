// Phase II 1H.3: Certificate Templates Admin Page
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RouteGuard from "@/components/RouteGuard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { 
  getCertificateTemplates, 
  createCertificateTemplate, 
  updateCertificateTemplate,
  setDefaultCertificateTemplate,
  subscribe 
} from "@/lib/store";
import { CertificateTemplate } from "@/types";
import CertificateTemplateForm from "@/components/admin/settings/CertificateTemplateForm";
import { Award, Edit, Star, Plus } from "lucide-react";

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>(getCertificateTemplates());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setTemplates(getCertificateTemplates());
    });
    return unsubscribe;
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleMakeDefault = (templateId: string) => {
    setDefaultCertificateTemplate(templateId);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  return (
    <RouteGuard>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.length === 0 ? (
              <Card className="col-span-full p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No certificate templates yet</p>
                <Button onClick={handleCreate}>Create Your First Template</Button>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                    </div>
                    {template.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Primary Color:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.primaryColor || "#2563EB" }}
                      />
                      <span className="font-mono text-xs">{template.primaryColor || "#2563EB"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Accent Color:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.accentColor || "#1E40AF" }}
                      />
                      <span className="font-mono text-xs">{template.accentColor || "#1E40AF"}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {template.signatures?.length || 0} signature(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="secondary"
                        onClick={() => handleMakeDefault(template.id)}
                        className="flex items-center justify-center gap-2 text-sm"
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {isFormOpen && (
          <CertificateTemplateForm
            template={editingTemplate}
            onClose={handleFormClose}
          />
        )}
      </AdminLayout>
    </RouteGuard>
  );
}



