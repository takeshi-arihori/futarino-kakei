import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "二人のかんたん家計簿",
  description: "カップル・夫婦のためのシンプルな家計管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <h1 className="text-xl font-bold">二人のかんたん家計簿</h1>
          </header>
          <main className="flex-grow p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
