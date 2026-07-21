"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface ISidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const SidebarItem = ({ item }: { item: ISidebarItem }) => {
  const { name, icon: Icon, path } = item;
  const pathname = usePathname();

  const isActive = useMemo(() => {
    return pathname.startsWith(path);
  }, [path, pathname]);

  return (
    <Link href={path}>
      <div
        className={`group flex items-center space-x-4 p-4 rounded-lg cursor-pointer ${
          isActive ? "text-active" : ""
        }`}
        style={{
          backgroundColor: isActive ? "#DF5C5D" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "#DF5C5D";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Icon size={18} className={`${isActive ? "text-white" : "group-hover:text-white"}`} />
        <p className={`text-sm font-medium ${isActive ? "text-white" : "group-hover:text-white"}`}>
          {name}
        </p>
      </div>
    </Link>
  );
};

export default SidebarItem;