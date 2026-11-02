import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/lib/auth";
import Header from "@/app/components/header/page";

export const metadata: Metadata = {
  title: "Learning App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}