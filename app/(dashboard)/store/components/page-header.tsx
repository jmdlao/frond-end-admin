"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  breadcrumbs: {
    label: string;
    href?: string;
    current?: boolean;
  }[];
  showAddButton?: boolean;
  showBackButton?: boolean;
  backHref?: string;
  addHref?: string;
}

export function PageHeader({
  title,
  breadcrumbs,
  showAddButton = false,
  showBackButton = false,
  backHref = '/store',
  addHref = '/store/add'
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 text-[14px]">
            {breadcrumbs.map((crumb, index) => (
              <li key={index}>
                {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                {crumb.href ? (
                  <Link 
                    href={crumb.href} 
                    className={`text-gray-500 hover:text-gray-700 ${crumb.current ? 'text-[#DF5C5D]' : ''}`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={crumb.current ? 'text-[#DF5C5D] font-medium' : 'text-gray-500'}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-[24px] font-[700] mt-5">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Link href={backHref}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        )}
        {showAddButton && (
          <Link href={addHref}>
            <Button className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 mt-10">
              <Plus className="mr-2 h-4 w-5" />
              Add Store
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
} 