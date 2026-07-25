import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoffeeHub - Drive-Through Dashboard",
  description: "Real-time dashboard for drive-through coffee shop operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-50 overflow-x-hidden">{children}</body>
    </html>
  );
}
