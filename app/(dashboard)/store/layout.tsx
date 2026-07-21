"use client";

import { StoreProvider } from './store-context';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StoreProvider>{children}</StoreProvider>;
} 