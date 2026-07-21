"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircleIcon,
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HeadphonesIcon,
  ImageIcon,
  PhoneIcon,
  VideoIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FileWithId,
  formatBytes,
  useFileUpload,
} from "../../../../hooks/use-file-upload";

//redux
import { useStoreControllerFindAllQuery } from "@/Redux/Services/storeApiService";
import { useAddUserControllerMutation } from "@/Redux/Services/userApiService";

const AddUserPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<{ id: string; text: string }[]>([]);
  const [tempTags, setTempTags] = useState<{ id: string; text: string }[]>([]);
  const [allBranches, setAllBranches] = useState<
    { id: string; name: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    role: "",
    branchLocation: [] as string[],
    email: "",
    contactNumber: "",
    resume: null as File | null,
    Province: "",
    cityTown: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [isAddUser, setIsAddUser] = useState(false);
  const [storePage, setStorePage] = useState(1);

  const { data: storesData, isFetching } = useStoreControllerFindAllQuery({
    page: storePage,
  });

  const totalStorePage = storesData?.response?.body?.pagination?.totalPages;

  const storesContent = storesData?.response?.body?.content || [];
  const storesDictionary = storesContent.reduce<Record<string, string>>(
    (acc, store) => {
      acc[store._id] = store.storeName;
      return acc;
    },
    {}
  );

  const branchesArray = Object.entries(storesDictionary).map(([id, name]) => ({
    id,
    name,
  }));

  useEffect(() => {
    if (storesData?.response?.body?.content) {
      const newBranches = storesData.response.body.content.map(
        (store: any) => ({
          id: store._id,
          name: store.storeName,
        })
      );
      setAllBranches((prev) => {
        // Avoid duplicates
        const ids = new Set(prev.map((b) => b.id));
        return [...prev, ...newBranches.filter((b) => !ids.has(b.id))];
      });
    }
  }, [storesData]);

  const filteredBranches = allBranches.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBranch = (branch: { id: string; name: string }) => {
    setTempTags((prev) => {
      const exists = prev.some((tag) => tag.id === branch.id);
      if (exists) {
        return prev.filter((tag) => tag.id !== branch.id);
      } else {
        return [...prev, { id: branch.id, text: branch.name }];
      }
    });
  };

  const handleConfirmSelection = () => {
    setTags(tempTags);
    setFormData((prev) => ({
      ...prev,
      branchLocation: tempTags.map((tag) => tag.id),
    }));
    setOpen(false);
  };

  // console.log("Tags:", tags);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    const phoneNumber = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, contactNumber: phoneNumber }));
  };

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

  const [addUserHere] = useAddUserControllerMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setErrorMessage("");
    console.log("Form Data:", formData);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: `${formData.cityTown}, ${formData.Province}`,
        birthDate: formData.birthDate,
        phoneNumber: formData.contactNumber,
        gender: formData.gender,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType:
          formData.role.toLocaleLowerCase() === "super-admin"
            ? 0
            : formData.role.toLocaleLowerCase() === "admin"
            ? 1
            : formData.role.toLocaleLowerCase() === "manager"
            ? 2
            : 3,
        userStoreLocations: formData.branchLocation.map((id) => ({
          storeID: id,
        })),
      };

      setIsAddUser(true);

      await addUserHere(payload)
        .unwrap()
        .then((payload) => {
          console.log("User created successfully:", payload);
          setTimeout(() => {
            setIsAddUser(false);
            router.push("/users");
          }, 1000);
        })
        .catch((error) => {
          console.error("Error creating User:", error);
          setErrorMessage(
            error?.data?.errors || "An error occurred while creating the user."
          );
          setIsAddUser(false);
        });
      // .catch((error) => {
      //   console.error("Error creating store:", error);
      //   setErrorMessage(addUserResponse.error.data.errors);
      // });
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      console.error("Error adding user:", error);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (formData.role.toLowerCase() === "cashier") {
      setTags([]);
      setTempTags([]);
      setFormData((prev) => ({
        ...prev,
        branchLocation: [],
      }));
    }
  }, [formData.role]);

  const maxSize = 100 * 1024 * 1024; // 100MB
  const maxFiles = 1; // Only allow one file for resume

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: false,
    maxFiles,
    maxSize,
  });

  const getFileIcon = (file: {
    file: File | { type: string; name: string };
  }) => {
    const fileType =
      file.file instanceof File ? file.file.type : file.file.type;
    const fileName =
      file.file instanceof File ? file.file.name : file.file.name;

    if (
      fileType.includes("pdf") ||
      fileName.endsWith(".pdf") ||
      fileType.includes("word") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      return <FileTextIcon className="size-4 opacity-60" />;
    } else if (
      fileType.includes("zip") ||
      fileType.includes("archive") ||
      fileName.endsWith(".zip") ||
      fileName.endsWith(".rar")
    ) {
      return <FileArchiveIcon className="size-4 opacity-60" />;
    } else if (
      fileType.includes("excel") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsx")
    ) {
      return <FileSpreadsheetIcon className="size-4 opacity-60" />;
    } else if (fileType.includes("video/")) {
      return <VideoIcon className="size-4 opacity-60" />;
    } else if (fileType.includes("audio/")) {
      return <HeadphonesIcon className="size-4 opacity-60" />;
    } else if (fileType.startsWith("image/")) {
      return <ImageIcon className="size-4 opacity-60" />;
    }
    return <FileIcon className="size-4 opacity-60" />;
  };

  return (
    <div className="flex flex-col w-full p-4 gap-1">
      {/* Error Message */}
      {/* Breadcrumb and Back Button */}
      <div className="flex items-center justify-between">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link
                href="/users"
                className="text-gray-500 hover:text-gray-700 text-[14px]"
              >
                Users
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-[#DF5C5D] text-[14px] font-medium">
                Add New User
              </span>
            </li>
          </ol>
        </nav>
        <Link href="/users">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="text-[24px] font-[700] mb-2">New User Registration</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="mb-0.5 font-medium">
                  First Name <span className="text-[#DF5C5D]">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  required
                  className="py-2 px-3 h-10"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="mb-0.5 font-medium">
                  Last Name <span className="text-[#DF5C5D]">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  required
                  className="py-2 px-3 h-10"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Birth Date, Gender, Role Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="birthDate" className="mb-0.5 font-medium">
                  Birth Date <span className="text-[#DF5C5D]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 h-10 bg-transparent pr-10 appearance-none 
                      [&::-webkit-calendar-picker-indicator]:opacity-0 
                      [&::-webkit-datetime-edit]:text-gray-500 
                      [&::-webkit-datetime-edit-fields-wrapper]:p-0 
                      [&::-webkit-datetime-edit-text]:text-gray-500 
                      [&::-webkit-datetime-edit]:empty:before:content-['Select_date']
                      [&::-moz-datetime-edit]:text-gray-500
                      [&::-moz-datetime-edit-fields-wrapper]:p-0
                      [&::-moz-datetime-edit-text]:text-gray-500
                      [&::-moz-datetime-edit]:empty:before:content-['Select_date']
                      [&::-ms-clear]:hidden
                      [&::-ms-expand]:hidden"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }))
                    }
                    placeholder="Select date"
                    aria-label="Birth date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        "birthDate"
                      ) as HTMLInputElement;
                      input?.showPicker();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Open date picker"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="mb-0.5 font-medium">
                  Gender <span className="text-[#DF5C5D]">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="px-3 py-2 h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="mb-0.5 font-medium">
                  Select a Role <span className="text-[#DF5C5D]">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="px-3 py-2 h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Super-Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role.toLowerCase() !== "cashier" ? (
                <div className="flex flex-col gap-2">
                  <Label className="mb-0.5 font-medium">
                    Branch Location
                    {/*  <span className="text-[#DF5C5D]">*</span> */}
                  </Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={
                          tags.length > 0
                            ? `${tags.length} branch(es) selected`
                            : "Select branches"
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10"
                        onClick={() => setOpen(true)}
                        disabled={
                          formData.role.toLowerCase() === "cashier"
                            ? true
                            : false
                        }
                      />
                      <ChevronsUpDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setOpen(!open)}
                      />
                    </div>
                    {open && (
                      <div className="absolute z-50 w-[500px] px mt-1 bg-white border rounded-md shadow-lg">
                        <div className="p-2">
                          <div
                            className="mt-1.5 max-h-[160px] overflow-auto rounded-md border"
                            onScroll={async (e) => {
                              const target = e.target as HTMLDivElement;
                              if (
                                target.scrollTop + target.clientHeight >=
                                  target.scrollHeight - 10 &&
                                storePage < (totalStorePage ?? 1) &&
                                !isFetching
                              ) {
                                setStorePage((prev) => prev + 1);
                              }
                            }}
                          >
                            {filteredBranches.length === 0 ? (
                              <div className="p-2 text-[14px] text-muted-foreground text-center">
                                No branch found.
                              </div>
                            ) : (
                              <>
                                {filteredBranches.map((branch) => (
                                  <div
                                    key={branch.id}
                                    className="flex items-center mt-2 p-1 hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => toggleBranch(branch)}
                                  >
                                    <Check
                                      className={cn(
                                        "ml-3 mr-1.5 h-3.5 w-3.5",
                                        tempTags.some(
                                          (tag) => tag.id === branch.id
                                        )
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="text-[14px]">
                                      {branch.name}
                                    </span>
                                  </div>
                                ))}
                                {isFetching && (
                                  <div className="flex justify-center py-2">
                                    <span className="text-xs text-muted-foreground">
                                      Loading...
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex justify-end mt-2 pt-2 border-t">
                            <Button
                              type="button"
                              onClick={handleConfirmSelection}
                              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 px-15 h-7 text-xs"
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="flex items-center gap-4 px-2 py-1 bg-[#DF5C5D]/20 hover:bg-[#DF5C5D]/30 transition-colors border-[#DF5C5D]"
                          >
                            <span className="text-[12px] text-[#DF5C5D] ml-1">
                              {tag.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setTags((prev) =>
                                  prev.filter((t) => t.id !== tag.id)
                                );
                                setTempTags((prev) =>
                                  prev.filter((t) => t.id !== tag.id)
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  branchLocation: prev.branchLocation.filter(
                                    (id) => id !== tag.id
                                  ),
                                }));
                              }}
                              className="ml-1 hover:text-[#DF5C5D] transition-colors"
                            >
                              <X className="h-3 w-3 text-[#DF5C5D]" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Email and Contact Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="mb-0.5 font-medium">
                  Email Address{" "}
                  <span className="font-normal text-[#DF5C5D] text-sm">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="py-2 px-3 h-10 bg-transparent"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactNumber" className="mb-0.5 font-medium">
                  Contact Number <span className="text-[#DF5C5D]">*</span>
                </Label>
                <div className="flex rounded-md shadow-xs">
                  <div className="border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex items-center self-stretch rounded-s-md border py-2 ps-3 pe-5 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50">
                    <div
                      className="inline-flex items-center gap-1"
                      aria-hidden="true"
                    >
                      <span className="w-5 overflow-hidden rounded-sm">
                        <PhoneIcon size={16} aria-hidden="true" />
                      </span>
                      <span className="text-muted-foreground/80">+63</span>
                    </div>
                  </div>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    required
                    className="h-11 flex-1 rounded-s-none border-l-0 focus-visible:border-[#DF5C5D] focus-visible:ring-[#DF5C5D]/50 focus-visible:ring-[3px]"
                    value={formatPhoneNumber(formData.contactNumber)}
                    onChange={handlePhoneChange}
                    maxLength={12}
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="resume" className="mb-0.5 font-medium">
                Professional Profile
              </Label>
              <div className="flex flex-col gap-2">
                {/* Drop area */}
                <div
                  role="button"
                  onClick={openFileDialog}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-dragging={isDragging || undefined}
                  className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                >
                  <input
                    {...getInputProps()}
                    className="sr-only"
                    aria-label="Upload files"
                  />

                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                      aria-hidden="true"
                    >
                      <FileUpIcon className="size-4 opacity-60" />
                    </div>
                    <p className="mb-1.5 text-sm font-medium">Upload files</p>
                    <p className="text-muted-foreground mb-2 text-xs">
                      Drag & drop or click to browse
                    </p>
                    <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-xs">
                      <span>PDF, DOC, DOCX</span>
                      <span>∙</span>
                      <span>Max {maxFiles} file</span>
                      <span>∙</span>
                      <span>Up to {formatBytes(maxSize)}</span>
                    </div>
                  </div>
                </div>

                {errors.length > 0 && (
                  <div
                    className="text-destructive flex items-center gap-1 text-xs"
                    role="alert"
                  >
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{errors[0]}</span>
                  </div>
                )}

                {/* File list */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file: FileWithId) => (
                      <div
                        key={file.id}
                        className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <p className="truncate text-[13px] font-medium">
                              {file.file.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatBytes(file.file.size)}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                          onClick={() => removeFile(file.id)}
                          aria-label="Remove file"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3">
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="Province" className="mb-1 font-medium">
                Province <span className="text-[#DF5C5D]">*</span>
              </Label>
              <Input
                id="Province"
                placeholder="Enter Province"
                required
                className="px-3 py-2 h-10 bg-transparent"
                value={formData.Province}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, Province: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cityTown" className="mb-1 font-medium">
                City/Town <span className="text-[#DF5C5D]">*</span>
              </Label>
              <Input
                id="cityTown"
                placeholder="Enter city/town"
                required
                className="px-3 py-2 h-10 bg-transparent"
                value={formData.cityTown}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cityTown: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="mb-1 font-medium">
                Username <span className="text-[#DF5C5D]">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                required
                className="px-3 py-2 h-10"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="mb-1 font-medium">
                Password <span className="text-[#DF5C5D]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  required
                  className="px-3 py-2 h-10 pr-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="mb-1 font-medium">
                Confirm Password <span className="text-[#DF5C5D]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                  className="px-3 py-2 h-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
              {errorMessage}
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            disabled={isAddUser}
          >
            {isAddUser ? "Creating user..." : "Add New User"}
            {isAddUser && (
              <svg
                className="animate-spin ml-2 h-4 w-4 text-white"
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
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Add User</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to add this user?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DF5C5D] text-white"
              onClick={handleConfirmSubmit}
            >
              Yes, Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddUserPage;
