import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="h-10 w-full flex items-center">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-[12px]">
              Dashboard
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index}>
              <span className="text-gray-400 mx-2">/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 text-[12px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#DF5C5D] text-[12px] font-medium">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
} 