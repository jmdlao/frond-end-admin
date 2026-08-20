"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useEditStoreMutation } from "@/Redux/Services/storeApiService";
import { Clock, Edit, Search } from "lucide-react";
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
  onEdit: (store: Store) => void;
  onViewDetails: (id: string) => void;
  loading?: boolean;
}

const formatTime = (time: string) => {
  if (!time) return "";
  if (/am|pm/i.test(time)) {
    return time.trim();
  }
  const [hours, minutes] = time.split(":");
  if (hours === undefined || minutes === undefined) return time;
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const StoreTable = ({
  stores,
  onEdit,
  onViewDetails,
  loading,
}: StoreTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100 border-x-0">
          <TableHead className="w-[50px] pl-10 border-x-0">No.</TableHead>
          <TableHead className="w-[200px] border-x-0">Store Name</TableHead>
          <TableHead className="w-[250px] border-x-0">
            Branch Location
          </TableHead>
          <TableHead className="w-[150px] border-x-0">Opening Time</TableHead>
          <TableHead className="w-[150px] border-x-0">Closing Time</TableHead>
          <TableHead className="text-center w-[120px] border-x-0">
            Action
          </TableHead>
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
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit(store)}
                    title="Edit Store Branch"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#DF5C5D] hover:text-[#DF5C5D]/90 font-medium"
                    onClick={() => onViewDetails(store.id)}
                    title="View Store Details"
                  >
                    View
                  </Button>
                </div>
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
    storeRefetch,
  } = useStore();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editOpenTime, setEditOpenTime] = useState("");
  const [editCloseTime, setEditCloseTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editStoreMutation] = useEditStoreMutation();

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setEditName(store.name);
    setEditLocation(store.location);
    setEditOpenTime(store.openingTime || "08:00 AM");
    setEditCloseTime(store.closingTime || "09:00 PM");
    setShowEditModal(true);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/store/${id}`);
  };

  const handleSaveStoreEdit = async () => {
    if (!selectedStore) return;
    setIsSubmitting(true);
    try {
      await editStoreMutation({
        storeID: selectedStore.id,
        storeName: editName,
        storeLocation: editLocation,
        storeOpenClosing: `${editOpenTime} - ${editCloseTime}`,
      }).unwrap();

      if (storeRefetch) storeRefetch();
      setShowEditModal(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Failed to edit store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

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
        onViewDetails={handleViewDetails}
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

      {/* Edit Store Branch Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Store Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label htmlFor="editStoreName">Store Name</Label>
              <Input
                id="editStoreName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="editStoreLocation">Branch Location / Address</Label>
              <Input
                id="editStoreLocation"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Enter branch location"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="editOpenTime">Opening Time</Label>
                <Input
                  id="editOpenTime"
                  value={editOpenTime}
                  onChange={(e) => setEditOpenTime(e.target.value)}
                  placeholder="08:00 AM"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="editCloseTime">Closing Time</Label>
                <Input
                  id="editCloseTime"
                  value={editCloseTime}
                  onChange={(e) => setEditCloseTime(e.target.value)}
                  placeholder="09:00 PM"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStoreEdit}
              disabled={isSubmitting}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreContent;
