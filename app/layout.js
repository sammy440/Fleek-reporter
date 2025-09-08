import { Montserrat } from "next/font/google";
import "@/app/_styles/globals.css";
import Navigation from "./_components/Navigation";
import { Providers } from "./provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Fleek Reporter",
  description: "A simple reporter app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body className={`${montserrat.className} min-h-screen`}>
        <Providers>
          <Navigation />
          <main className="flex-grow">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
