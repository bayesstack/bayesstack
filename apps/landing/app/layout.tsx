import "./globals.css";

export const metadata = {
  title: "BayesStack | Landing",
  description: "BayesStack landing page",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
