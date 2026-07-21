"use client";

import { StoreProvider } from "../store-context";
import { StoreFormProvider } from "./Context";

export default function AddStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <StoreFormProvider>{children}</StoreFormProvider>
    </StoreProvider>
  );
}
