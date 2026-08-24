import "./globals.css";

export const metadata = { title: "BayesStack | Admin", description: "BayesStack administration application" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
