// Phase II 1H.3: Certificate Render Component - Exciting Landscape Design
"use client";

import React from "react";
import { Certificate, CertificateTemplate } from "@/types";
import { getOrganization } from "@/lib/store";
import { formatDate } from "@/lib/utils";

interface CertificateRenderProps {
  certificate: Certificate;
  template: CertificateTemplate;
}

export default function CertificateRender({
  certificate,
  template,
}: CertificateRenderProps) {
  const org = getOrganization();

  // Landscape A4 dimensions (at 96 DPI): 1123 x 794px
  // Using slightly smaller dimensions for better display
  const width = 1123;
  const height = 794;

  const primaryColor = template.primaryColor || "#2563EB";
  const accentColor = template.accentColor || "#1E40AF";

  // Create gradient colors
  const gradientStart = primaryColor;
  const gradientEnd = accentColor;

  return (
    <div
      id="certificate-render"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        backgroundColor: "#ffffff",
        backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : `linear-gradient(135deg, ${gradientStart}15 0%, ${gradientEnd}08 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      {/* Decorative Border Frame */}
      <div
        style={{
          position: "absolute",
          inset: "30px",
          border: `8px solid ${primaryColor}`,
          borderRadius: "12px",
          boxShadow: `0 0 0 4px ${accentColor}20, inset 0 0 60px ${primaryColor}10`,
        }}
      />
      
      {/* Corner Decorations */}
      <div
        style={{
          position: "absolute",
          top: "38px",
          left: "38px",
          width: "60px",
          height: "60px",
          borderTop: `4px solid ${accentColor}`,
          borderLeft: `4px solid ${accentColor}`,
          borderTopLeftRadius: "12px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "38px",
          right: "38px",
          width: "60px",
          height: "60px",
          borderTop: `4px solid ${accentColor}`,
          borderRight: `4px solid ${accentColor}`,
          borderTopRightRadius: "12px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "38px",
          left: "38px",
          width: "60px",
          height: "60px",
          borderBottom: `4px solid ${accentColor}`,
          borderLeft: `4px solid ${accentColor}`,
          borderBottomLeftRadius: "12px",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "38px",
          right: "38px",
          width: "60px",
          height: "60px",
          borderBottom: `4px solid ${accentColor}`,
          borderRight: `4px solid ${accentColor}`,
          borderBottomRightRadius: "12px",
        }}
      />

      {/* Decorative Top Banner */}
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "50px",
          right: "50px",
          height: "100px",
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 24px ${primaryColor}40`,
        }}
      >
        {/* Organization Logo */}
        {template.showOrgLogo && org.logo && (
          <img
            src={org.logo}
            alt={org.name}
            style={{
              maxWidth: "180px",
              maxHeight: "70px",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
        {(!template.showOrgLogo || !org.logo) && (
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {org.name}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: "absolute",
          top: "170px",
          left: "100px",
          right: "100px",
          bottom: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          paddingTop: "30px",
        }}
      >
        {/* Decorative Seal/Emblem */}
        <div
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            border: `4px solid ${accentColor}`,
            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${accentColor}20 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            boxShadow: `0 4px 16px ${primaryColor}30`,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              color: accentColor,
              fontWeight: "bold",
            }}
          >
            ✓
          </div>
          <div
            style={{
              position: "absolute",
              inset: "-5px",
              borderRadius: "50%",
              border: `2px solid ${primaryColor}30`,
            }}
          />
        </div>

        {/* Certificate Title */}
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "bold",
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "12px",
            textAlign: "center",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontFamily: "'Georgia', serif",
            lineHeight: "1.2",
          }}
        >
          Certificate of Completion
        </h1>

        {/* Decorative Divider */}
        <div
          style={{
            width: "220px",
            height: "3px",
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            marginBottom: "30px",
            borderRadius: "2px",
          }}
        />

        {/* Certificate Body */}
        <div
          style={{
            fontSize: "18px",
            color: "#374151",
            textAlign: "center",
            marginBottom: "25px",
            lineHeight: "1.7",
            maxWidth: "850px",
          }}
        >
          <p style={{ marginBottom: "18px", fontSize: "17px", color: "#4b5563", fontWeight: "400" }}>
            This is to certify that
          </p>
          {template.fields.showUserName && (
            <p
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "18px",
                letterSpacing: "1.5px",
                lineHeight: "1.3",
              }}
            >
              {certificate.userName || "Learner Name"}
            </p>
          )}
          <p style={{ marginBottom: "18px", fontSize: "17px", color: "#4b5563", fontWeight: "400" }}>
            has successfully completed the course
          </p>
          {template.fields.showCourseTitle && (
            <div
              style={{
                fontSize: "26px",
                fontWeight: "600",
                color: accentColor,
                marginBottom: "18px",
                padding: "16px 45px",
                background: `linear-gradient(135deg, ${primaryColor}10 0%, ${accentColor}10 100%)`,
                borderRadius: "8px",
                border: `2px solid ${primaryColor}25`,
                display: "inline-block",
                maxWidth: "100%",
              }}
            >
              {certificate.courseTitle || "Course Title"}
            </div>
          )}
        </div>

        {/* Custom Text */}
        {template.fields.showCustomText && template.fields.customText && (
          <div
            style={{
              fontSize: "16px",
              color: "#6b7280",
              textAlign: "center",
              marginBottom: "25px",
              fontStyle: "italic",
              maxWidth: "800px",
              lineHeight: "1.6",
            }}
          >
            {template.fields.customText}
          </div>
        )}

        {/* Issued Date */}
        {template.fields.showIssuedAt && (
          <div
            style={{
              fontSize: "16px",
              color: "#6b7280",
              marginBottom: "10px",
              fontWeight: "500",
            }}
          >
            Issued on {formatDate(certificate.issuedAt)}
          </div>
        )}
      </div>

      {/* Bottom Section with Serial and Signatures */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          left: "100px",
          right: "100px",
        }}
      >
        {/* Signatures */}
        {template.showSignatures && template.signatures && template.signatures.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-start",
              marginBottom: "20px",
              gap: "50px",
            }}
          >
            {template.signatures.map((sig, index) => (
              <div
                key={index}
                style={{
                  textAlign: "center",
                  flex: "1",
                  maxWidth: "280px",
                }}
              >
                <div
                  style={{
                    borderTop: `3px solid ${accentColor}`,
                    width: "220px",
                    margin: "0 auto 8px",
                    paddingTop: "40px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: accentColor,
                      border: `2px solid #ffffff`,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: primaryColor,
                    marginBottom: "3px",
                  }}
                >
                  {sig.name}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  {sig.title}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Serial Number */}
        {template.fields.showSerial && (
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#9ca3af",
              fontFamily: "monospace",
              letterSpacing: "1px",
              paddingTop: "10px",
              borderTop: `1px solid ${primaryColor}20`,
            }}
          >
            Serial Number: <span style={{ fontWeight: "600", color: "#6b7280" }}>{certificate.serial}</span>
          </div>
        )}
      </div>

      {/* Decorative Background Pattern */}
      <div
        style={{
          position: "absolute",
          inset: "0",
          opacity: "0.03",
          backgroundImage: `radial-gradient(circle at 2px 2px, ${primaryColor} 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

