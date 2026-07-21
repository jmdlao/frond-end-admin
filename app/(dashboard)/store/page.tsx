"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "./components/page-header";
import { useStore } from "./store-context";

interface Store {
  id: string;
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
}

interface StoreTableProps {
  stores: Store[];
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
  onEdit: (id: string) => void;
  onViewSchedule: (id: string) => void;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const StoreTable = ({
  stores,
  selectedRows,
  setSelectedRows,
  onEdit,
  onViewSchedule,
  loading,
}: StoreTableProps & { loading: boolean }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[50px] pl-10">No.</TableHead>
          <TableHead className="w-[200px]">Store Name</TableHead>
          <TableHead className="w-[250px]">Location</TableHead>
          <TableHead className="w-[150px]">Opening Time</TableHead>
          <TableHead className="w-[150px]">Closing Time</TableHead>
          <TableHead className="w-[100px] text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="w-full">
            <TableCell colSpan={6} className="h-24 text-center">
              <div className="flex justify-center items-center gap-2 py-2">
                <svg
                  className="animate-spin h-5 w-5 text-[#DF5C5D]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : stores.length === 0 ? (
          <TableRow className="w-full">
            <TableCell colSpan={6} className="h-24 text-center">
              <span>No stores found</span>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-[#DF5C5D] border-[#DF5C5D] hover:bg-[#DF5C5D]/10"
                >
                  Reload Page
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          stores.map((store: Store, index: number) => (
            <TableRow key={store.id} className="hover:bg-gray-50">
              <TableCell className="pl-10">{index + 1}</TableCell>
              <TableCell className="font-medium">{store.name}</TableCell>
              <TableCell>{store.location}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatTime(store.openingTime)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatTime(store.closingTime)}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  className="text-[#DF5C5D] hover:text-[#DF5C5D]/90"
                  onClick={() => onEdit(store.id)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const StoreContent = () => {
  const router = useRouter();
  const {
    stores,
    totalPages,
    toCurrentPage,
    currentPage,
    isLoading,
    searchQuery,
    setSearchQuery,
  } = useStore();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pages, setPages] = useState<number[]>([]);
  const [showLeftEllipsis, setShowLeftEllipsis] = useState(false);
  const [showRightEllipsis, setShowRightEllipsis] = useState(false);
  const itemsPerPage = 10;
  const searchParams = useSearchParams();

  const handleEdit = (id: string) => {
    router.push(`/store/${id}`);
  };

  const handleViewSchedule = (id: string) => {
    router.push(`/store/${id}/schedule`);
  };

  return (
    <div className="flex flex-col w-full p-4 gap-4 text-[14px]">
      <PageHeader
        title="Store Branch"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Store Branch", current: true },
        ]}
        showAddButton
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <StoreTable
        stores={stores}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onEdit={handleEdit}
        onViewSchedule={handleViewSchedule}
        loading={isLoading}
      />

      {/* Pagination */}
      <div className="mt-4">
        <div className="text-sm text-gray-500 mb-2">
          Showing page {currentPage} of {totalPages} pages
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => toCurrentPage(currentPage - 1)}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>

            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-red-600 text-white font-medium"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => toCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}

            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => toCurrentPage(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default StoreContent;
