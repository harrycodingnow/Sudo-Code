import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SudoCode",
  description: "Practice algorithms without getting blocked by syntax.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
