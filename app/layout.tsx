// Phase I Epic 1 & 2: Root layout with brand provider
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
      <body className="bg-gray-50">
        <BrandProvider>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}

