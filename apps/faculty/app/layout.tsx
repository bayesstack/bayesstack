import "./globals.css";

export const metadata = { title: "BayesStack | Faculty", description: "BayesStack faculty application" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
