import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uçuş Takip",
  description: "Kişisel uçuş fiyat takip uygulaması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#0a0a0f" }}>{children}</body>
    </html>
  );
}
