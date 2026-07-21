"use client";

import React from "react";

interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  showAddButton,
  onAddClick,
}) => (
  <div className="mb-4">
    <nav className="mb-2 text-sm text-gray-500 flex items-center gap-2">
      {breadcrumbs.map((crumb, idx) => (
        <span key={crumb.label} className="flex items-center gap-2">
          {crumb.href && !crumb.current ? (
            <a href={crumb.href} className="hover:underline text-gray-600">
              {crumb.label}
            </a>
          ) : (
            <span className={crumb.current ? "text-[#DF5C5D] font-semibold" : ""}>
              {crumb.label}
            </span>
          )}
          {idx < breadcrumbs.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {showAddButton && (
        <button
          onClick={onAddClick}
          className="bg-[#DF5C5D] text-white px-4 py-2 rounded hover:bg-[#c94b4b]"
        >
          Add
        </button>
      )}
    </div>
  </div>
); 