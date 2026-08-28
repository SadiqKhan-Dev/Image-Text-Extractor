import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Image Text Extractor | OCR Tool',
  description:
    'Extract text from images instantly using Tesseract.js OCR. Supports PNG, JPG, JPEG, and WEBP formats.',
  keywords: ['OCR', 'image text extraction', 'Tesseract', 'text recognition'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
