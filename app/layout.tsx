import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>MERQIO - Admin POS</title>
        <link rel="icon" href="/MERQIO_Logo_1.png" type="image/png" />
        <link rel="shortcut icon" href="/MERQIO_Logo_1.png" type="image/png" />
        <link rel="apple-touch-icon" href="/MERQIO_Logo_1.png" type="image/png" />
        <meta name="description" content="MERQIO Point of Sale & Management System" />
      </head>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
