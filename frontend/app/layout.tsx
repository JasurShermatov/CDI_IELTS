import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "CDI IELTS — Practice Platform",
    template: "%s | CDI IELTS",
  },
  description:
    "Comprehensive IELTS practice platform with full-length tests, expert writing feedback, and live speaking sessions.",
  keywords: ["IELTS", "practice", "test", "writing", "speaking", "CDI"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 bg-gray-50">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
