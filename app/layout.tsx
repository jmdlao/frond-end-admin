"use client";

import store from "@/state/store";
import { Poppins } from "next/font/google";
import { Provider } from "react-redux";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// export const metadata: Metadata = {
//   title: "Admin POS",
//   description: "IntelliSeven",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <body className={poppins.className}>{children}</body>
      </Provider>
    </html>
  );
}
