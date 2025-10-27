// Phase I Epic 1, 2 & Polish Pack: Root layout with brand provider and accessibility
import type { Metadata } from "next";
import "./globals.css";
import BrandProvider from "@/components/BrandProvider";

export const metadata: Metadata = {
  title: "UpKeep LMS",
  description: "Compliance-focused Learning Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <BrandProvider>
          <div id="main-content">
            {children}
          </div>
        </BrandProvider>
      </body>
    </html>
  );
}

