import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthModalProvider } from "@/contexts/auth-modal-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PixelDraw - AI 驱动的图片处理平台",
  description: "智能图片压缩、AI 抠图、内容识别、AI 生成图像",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        layout: {
          logoPlacement: 'inside',
        },
      }}
    >
      <html lang="zh-CN">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthModalProvider>
            {children}
          </AuthModalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
