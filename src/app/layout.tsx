import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/ui/Toaster";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat Messaging App",
  description:
    "Instantly connect worldwide with our user-friendly chat messaging app for seamless real-time communication.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
