"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { useUserControllerFindAllQuery } from "@/Redux/Services/userApiService";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  role: string;
}

const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  // Format as XXX-XXX-XXXX
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return value;
};

const UsersPage = () => {
  const router = useRouter();
  const [selectedRoles, setSelectedRoles] = useState("All Roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: users,
    refetch: usersRefetch,
    isFetching: userFetching,
    error: fetchingError,
  } = useUserControllerFindAllQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    userType:
      selectedRoles.toLowerCase() === "all roles"
        ? undefined
        : selectedRoles.toLowerCase() === "super-admin"
        ? 0
        : selectedRoles.toLowerCase() === "admin"
        ? 1
        : selectedRoles.toLowerCase() === "manager"
        ? 2
        : selectedRoles.toLowerCase() === "cashier"
        ? 3
        : undefined,
  });

  const usersData: User[] =
    users?.response?.body?.content?.map((user) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.address,
      phoneNumber:
        user.phoneNumber !== undefined ? String(user.phoneNumber) : "",
      role:
        user.userType === 0
          ? "Super-Admin"
          : user.userType === 1
          ? "Admin"
          : user.userType === 2
          ? "Manager"
          : user.userType === 3
          ? "Cashier"
          : "User",
    })) || [];

  const usersDataLength = usersData.length ? usersData.length : 0;
  const totalPages = users?.response?.body?.pagination?.totalPages || 1;

  useEffect(() => {
    usersRefetch();
  }, [currentPage, usersRefetch]);

  useEffect(() => {
    if (searchQuery.length > 0 || selectedRoles !== "All Roles") {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedRoles]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(tempSearchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [tempSearchQuery]);

  const handleSelect = (role: string) => {
    if (role === "All Roles") {
      setSelectedRoles("");
    } else {
      setSelectedRoles(role);
    }
  };

  const handleReload = () => {
    usersRefetch();
  };

  const id = useId();

  return (
    <div className="flex flex-col w-full p-4 h-full" suppressHydrationWarning>
      <PageHeader
        title="User Administration"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", current: true },
        ]}
      />

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-[2] min-w-[200px]">
          <Input
            type="text"
            placeholder="Search for users..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedRoles || "All Roles"}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => handleSelect("All Roles")}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelect("Super-Admin")}>
                Super-Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelect("Admin")}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelect("Manager")}>
                Manager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSelect("Cashier")}>
                Cashier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 min-w-[150px]">
          <Link href="/users/add" className="w-full block">
            <Button className="bg-[#DF5C5D] text-white w-full">
              Add New User
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div
        className="mt-4 flex-1 overflow-auto rounded"
        style={{ maxHeight: "calc(100vh - 150px)" }}
      >
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">No.</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[200px]">Location</TableHead>
              <TableHead className="w-[150px]">Phone Number</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userFetching ? (
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
            ) : (
              <>
                {!fetchingError ? (
                  usersData.map((user, idx) => {
                    // Normalize role for comparison
                    const role = (user.role || "user").toLowerCase();
                    let roleColor =
                      "bg-gray-100 text-gray-700 border border-gray-300";
                    if (role.toLowerCase() === "super-admin")
                      roleColor =
                        "bg-red-100 text-red-700 border border-red-200";
                    else if (role.toLowerCase() === "admin")
                      roleColor =
                        "bg-blue-100 text-blue-700 border border-blue-200";
                    else if (role.toLowerCase() === "manager")
                      roleColor =
                        "bg-green-100 text-green-700 border border-green-200";
                    else if (role.toLowerCase() === "cashier")
                      roleColor =
                        "bg-gray-100 text-gray-700 border border-gray-200";
                    // Add more roles/colors as needed

                    return (
                      <TableRow key={user.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-semibold">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="opacity-[.67]">
                          {user.location}
                        </TableCell>
                        <TableCell className="opacity-[.67]">
                          {formatPhoneNumber(user.phoneNumber)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full min-w-[80px] h-7 px-3 text-xs font-semibold capitalize",
                              roleColor
                            )}
                          >
                            {user.role || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchQuery ? (
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-gray-500">
                            No users found matching "{searchQuery}"
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-500">No users found</p>
                          <Button
                            className="mt-4 bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                            onClick={() => handleReload()}
                          >
                            Reload
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav
          className="inline-flex items-center space-x-1 text-sm"
          aria-label="Pagination"
        >
          {/* Previous Button */}
          <button
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Pagination Buttons */}
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
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default UsersPage;
