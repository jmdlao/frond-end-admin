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
  Download,
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
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useMemo, useState } from "react";
import {
  FileWithId,
  formatBytes,
  useFileUpload,
} from "../../../../hooks/use-file-upload";

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

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";

// DataBase/API
// const getUserById = (id: string) => {
//   const users = [
//     {
//       id: "1",
//       firstName: "John",
//       lastName: "Doe",
//       birthDate: "1990-01-01",
//       gender: "male",
//       email: "john.doe@example.com",
//       contactNumber: "123-456-7890",
//       userType: "admin",
//       resume: null,
//       Province: "10001",
//       cityTown: "New York",
//       username: "johndoe",
//       password: "********",
//       confirmPassword: "********",
//       branchLocation: "main"
//     },
//   ];
//   return users.find(user => user.id === id);
// };

interface UserFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  contactNumber: string;
  resume: File | null;
  branchLocation: string | string[];

  // Address Information
  Province: string;
  cityTown: string;

  // Account Details
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  userType: string;
}

interface PageParams {
  id: string;
}

interface userDataInterface {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  phoneNumber: string;
  resume: File | null;
  branchLocation: string;
  Province: string;
  cityTown: string;
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  userType: string;
}

// redux
import {
  useUpdateUserControllerMutation,
  useUserControllerFindIDQuery,
} from "@/Redux/Services/userApiService";

import { useStoreControllerFindAllQuery } from "@/Redux/Services/storeApiService";

const EditUserPage = ({ params }: { params: Promise<PageParams> }) => {
  const router = useRouter();
  const resolvedParams = use(params);

  const { data: userData, isLoading } = useUserControllerFindIDQuery({
    userID: resolvedParams.id,
  });

  const [UpdateUser] = useUpdateUserControllerMutation();

  // console.log("User Data:", userData?.response.body.content);
  // const userContent = userData?.response.body.content;
  // const getUserById = async (id: string) => {
  //   const users = await [
  //     {
  //       id: resolvedParams.id,
  //       firstName: userContent?.firstName,
  //       lastName: userContent?.lastName,
  //       birthDate: userContent?.birthDate,
  //       gender: userContent?.gender,
  //       email: "john.doe@example.com",
  //       phoneNumber: userContent?.phoneNumber,
  //       userType:
  //         userContent?.userType === 0
  //           ? "super-admin"
  //           : userContent?.userType === 1
  //           ? "admin"
  //           : userContent?.userType === 2
  //           ? "manager"
  //           : userContent?.userType === 3
  //           ? "cashier"
  //           : "user",
  //       resume: null,
  //       Province: userContent?.address,
  //       cityTown: userContent?.address,
  //       username: userContent?.username,
  //       password: "********",
  //       confirmPassword: "********",
  //       branchLocation: userContent?.userStoreLocations[0].storeID || "",
  //     },
  //   ];
  //   return users.find((user) => user.id === id);
  // };

  const user = userData?.response?.body?.content;
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    email: "",
    contactNumber: "",
    resume: null,
    branchLocation:
      Array.isArray(user?.userStoreLocations) &&
      user?.userStoreLocations.length > 0
        ? String(user.userStoreLocations[0].storeID)
        : "",

    // Address Information
    Province: "",
    cityTown: "",

    // Account Details
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    userType: "",
  });
  // console.log("Form Data:", formData);
  // console.log("User:", user);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<{ id: string; text: string }[]>([]);
  const [tempTags, setTempTags] = useState<{ id: string; text: string }[]>([]);
  const [allBranches, setAllBranches] = useState<
    { id: string; name: string }[]
  >([]);

  const [showLeftEllipsis, setShowLeftEllipsis] = useState(false);
  const [showRightEllipsis, setShowRightEllipsis] = useState(false);
  const [storePage, setStorePage] = useState(1);

  const { data: storesData, isFetching } = useStoreControllerFindAllQuery({
    page: storePage,
  });

  const totalStorePage = storesData?.response?.body?.pagination?.totalPages;
  const storesContent = storesData?.response?.body?.content || [];
  const storesDictionary = useMemo(
    () =>
      storesContent.reduce<Record<string, string>>((acc, store) => {
        acc[store._id] = store.storeName;
        return acc;
      }, {}),
    [storesContent]
  );

  // const branchesArray = Object.entries(storesDictionary).map(([id, name]) => ({
  //   id,
  //   name,
  // }));

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

  // console.log("formdata:", formData.branchLocation);

  // useEffect(() => {
  //   handleConfirmSelection();
  // }, [tags]);

  useEffect(() => {
    if (user) {
      // Split the address into cityTown and Province if possible
      let cityTown = "";
      let Province = "";
      if (user.address) {
        const parts = user.address.split(", ");
        if (parts.length >= 2) {
          cityTown = parts[0].trim();
          Province = parts[1].trim();
        } else {
          cityTown = user.address.trim();
        }
      }
      setFormData((prev) => ({
        ...prev,
        // Personal Information
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthDate: user.birthDate || "",
        gender:
          user.gender?.toLowerCase() === "male"
            ? "Male"
            : user.gender?.toLowerCase() === "female"
            ? "Female"
            : "",
        email: "",
        contactNumber: user.phoneNumber || "",
        resume: null,
        // Address Information
        Province: Province || "",
        cityTown: cityTown || "",

        // Account Details
        username: user.username || "",
        userType:
          user.userType === 0
            ? "super-admin"
            : user.userType === 1
            ? "admin"
            : user.userType === 2
            ? "manager"
            : user.userType === 3
            ? "cashier"
            : "",
      }));

      if (Array.isArray(user.userStoreLocations)) {
        setTags(
          user.userStoreLocations.map((location: any) => ({
            id: location.storeID._id,
            text: location.storeID.storeName,
          }))
        );
        setTempTags(
          user.userStoreLocations.map((location: any) => ({
            id: location.storeID._id,
            text: location.storeID.storeName,
          }))
        );
      }

      // const matchedBranches =
      //   user?.userStoreLocations?.map((location) => {
      //     const branch = branchesArray.find(
      //       (branch) => branch.id === location.storeID
      //     );
      //     return {
      //       id: location.storeID,
      //       text: branch ? branch.name : "Unknown Branch",
      //     };
      //   }) || [];

      // setTags(matchedBranches);

      // console.log(branchesArray, "branchesArray");
      // console.log(allBranches, "allBranches");
    }
  }, [user]);

  useEffect(() => {
    console.log(formData.userType, "userType");
    console.log("formdata:", formData);
    console.log("tags:", tags);
  }, [formData.userType]);

  useEffect(() => {
    if (tempTags.length > 0) {
      setTags(tempTags);
    }
  }, [tempTags, setTags]);

  // console.log(tempTags, "tempTags");
  // console.log(tags, "tags");

  // console.log(formData, "After UseEffect");

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const maxSize = 100 * 1024 * 1024; // 100MB
  const maxFiles = 1; // Only allow one file for resume

  const [
    { files, isDragging, errors: fileErrors },
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
    accept: ".pdf,.doc,.docx",
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

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};
    const nameRegex = /^[a-zA-Z\s\.\-\ñ\Ñ]+$/;
    const usernameRegex = /^[a-zA-Z0-9_\.\-]+$/;

    // Personal Information validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!nameRegex.test(formData.firstName.trim())) {
      newErrors.firstName = "First name cannot contain numbers or special characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!nameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name cannot contain numbers or special characters";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (formData.contactNumber.trim() && !/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits";
    }

    if (formData.birthDate) {
      const birthDateObj = new Date(formData.birthDate);
      const today = new Date();
      if (birthDateObj > today) {
        newErrors.birthDate = "Birth date cannot be in the future";
      } else {
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        if (age < 15) {
          newErrors.birthDate = "User must be at least 15 years old";
        }
      }
    }

    // Address Information validation
    if (!formData.Province.trim()) {
      newErrors.Province = "Province is required";
    } else if (!nameRegex.test(formData.Province.trim())) {
      newErrors.Province = "Province cannot contain numbers or special characters";
    }

    if (!formData.cityTown.trim()) {
      newErrors.cityTown = "City/Town is required";
    } else if (!nameRegex.test(formData.cityTown.trim())) {
      newErrors.cityTown = "City/Town cannot contain numbers or special characters";
    }

    // Account Details validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!usernameRegex.test(formData.username.trim())) {
      newErrors.username = "Username can only contain letters, numbers, underscores, dots, and hyphens";
    }

    // Password validation - only if any password field is filled
    const hasPasswordChanges =
      formData.currentPassword.trim() ||
      formData.newPassword.trim() ||
      formData.confirmPassword.trim();

    if (hasPasswordChanges) {
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword =
          "Current password is required when changing password";
      }
      if (!formData.newPassword.trim()) {
        newErrors.newPassword =
          "New password is required when changing password";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
      } else if (formData.newPassword.length > 20) {
        newErrors.newPassword = "New password cannot exceed 20 characters";
      }
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "New passwords do not match";
      }
    }

    if (!formData.userType) {
      newErrors.userType = "User type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };


  const handleConfirmSubmit = async () => {
    setShowConfirm(false);

    const payload: any = {
      userID: resolvedParams.id,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      address: `${formData.cityTown}, ${formData.Province}`,
      birthDate: formData.birthDate || undefined,
      phoneNumber: formData.contactNumber || undefined,
      gender: formData.gender || undefined,
      username: formData.username || undefined,
      userType:
        formData.userType.toLowerCase() === "super-admin"
          ? 0
          : formData.userType.toLowerCase() === "admin"
          ? 1
          : formData.userType.toLowerCase() === "manager"
          ? 2
          : 3,
      userStoreLocations:
        Array.isArray(tags) && tags.length > 0
          ? tags.map((tag) => ({ storeID: tag.id }))
          : Array.isArray(formData.branchLocation)
          ? formData.branchLocation.map((id) => ({ storeID: id }))
          : formData.branchLocation
          ? [{ storeID: formData.branchLocation as string }]
          : [],
    };

    if (formData.newPassword && formData.newPassword.trim()) {
      payload.password = formData.newPassword;
      payload.confirmPassword = formData.confirmPassword;
    }

    console.log("Payload:", payload);
    try {
      const updateUsersData = await UpdateUser(payload).unwrap();
      console.log("Update Successful:", updateUsersData);
      setTimeout(() => {
        window.location.href = "/users";
      }, 100);
    } catch (error: any) {
      console.error("Update User Error:", error);
      const msg =
        error?.data?.response?.message ||
        error?.data?.message ||
        error?.data?.errors ||
        "Failed to update user. Please check form fields.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userType: value,
    }));
    if (errors.userType) {
      setErrors((prev) => ({
        ...prev,
        userType: undefined,
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = value;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 gap-1">
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
                Profile Page
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

      <div className="text-[24px] font-[700] mb-2">Account Details</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="mb-0.5 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  maxLength={60}
                  aria-describedby={errors?.firstName ? "err-regFirstName" : undefined}
                  aria-invalid={!!errors?.firstName}
                  className={`py-2 px-3 h-10 bg-transparent ${
                    errors?.firstName ? "border-red-500" : ""
                  }`}
                />
                {errors.firstName && (
                  <p id="err-regFirstName" role="alert" className="text-[#DF5C5D] text-sm">{errors.firstName}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="mb-0.5 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  maxLength={60}
                  aria-describedby={errors?.lastName ? "err-regLastName" : undefined}
                  aria-invalid={!!errors?.lastName}
                  className={`py-2 px-3 h-10 bg-transparent ${
                    errors?.lastName ? "border-red-500" : ""
                  }`}
                />
                {errors.lastName && (
                  <p id="err-regLastName" role="alert" className="text-[#DF5C5D] text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Birth Date, Gender, Role Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="birthDate" className="mb-0.5 font-medium">
                  Birth Date
                </Label>
                <div className="relative">
                  <Input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
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
                <Label className="mb-0.5 font-medium">Gender</Label>
                <Select
                  value={
                    formData.gender && formData.gender.length > 0
                      ? formData.gender
                      : user?.gender
                      ? user.gender
                      : ""
                  }
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="px-3 py-2 h-10">
                    <SelectValue
                      placeholder={
                        formData.gender && formData.gender.length > 0
                          ? formData.gender
                          : user?.gender
                          ? user.gender
                          : ""
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={60}
                  aria-describedby={errors?.email ? "err-reg-email" : undefined}
                  aria-invalid={!!errors?.email}
                  className={`py-2 px-3 h-10 bg-transparent ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p id="err-reg-email" role="alert" className="text-[#DF5C5D] text-sm">{errors.email}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactNumber" className="mb-0.5 font-medium">
                  Contact Number
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
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handlePhoneChange}
                    aria-describedby={errors?.contactNumber ? "err-reg-phone" : undefined}
                    aria-invalid={!!errors?.contactNumber}
                    className={`h-11 flex-1 rounded-s-none border-l-0 focus-visible:border-[#DF5C5D] focus-visible:ring-[#DF5C5D]/50 focus-visible:ring-[3px] ${
                      errors.contactNumber ? "border-red-500" : ""
                    }`}
                    required maxLength={12}
                  />
                </div>
                {errors.contactNumber && (
                  <p id="err-reg-phone" role="alert" className="text-[#DF5C5D] text-sm">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Role and Branch Location Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="mb-0.5 font-medium">
                  Select a type of User
                </Label>
                <Select
                  value={
                    formData.userType && formData.userType.length > 0
                      ? formData.userType
                      : user?.userType === 0
                      ? "super-admin"
                      : user?.userType === 1
                      ? "admin"
                      : user?.userType === 2
                      ? "manager"
                      : user?.userType === 3
                      ? "cashier"
                      : ""
                  }
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="px-3 py-2 h-10">
                    <SelectValue
                      placeholder={
                        formData.userType && formData.userType.length > 0
                          ? formData.userType
                          : user?.userType === 0
                          ? "super-admin"
                          : user?.userType === 1
                          ? "admin"
                          : user?.userType === 2
                          ? "manager"
                          : user?.userType === 3
                          ? "cashier"
                          : ""
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Super-Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType.toLowerCase() !== "cashier" ? (
                <div className="flex flex-col gap-2">
                  <Label className="mb-0.5 font-medium">
                    Branch Location <span className="text-[#DF5C5D]">*</span>
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
                        onClick={() =>
                          formData.userType.toLowerCase() !== "cashier" &&
                          setOpen(!open)
                        }
                      />
                      <ChevronsUpDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() =>
                          formData.userType.toLowerCase() !== "cashier" &&
                          setOpen(!open)
                        }
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
                            key={tag.id + 1}
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
                                setTempTags((prevTemp) =>
                                  prevTemp.filter((t) => t.id !== tag.id)
                                );
                              }}
                              disabled={user?.userType === 3}
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

            {/* Resume Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="resume" className="mb-0.5 font-medium">
                Resume
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

                {fileErrors.length > 0 && (
                  <div
                    className="text-destructive flex items-center gap-1 text-xs"
                    role="alert"
                  >
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{fileErrors[0]}</span>
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

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground/80 hover:text-foreground size-8 hover:bg-transparent"
                            onClick={() => {
                              const url = URL.createObjectURL(file.file);
                              window.open(url, "_blank");
                            }}
                            aria-label="View file"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground/80 hover:text-foreground size-8 hover:bg-transparent"
                            onClick={() => {
                              const url = URL.createObjectURL(file.file);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = file.file.name;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            aria-label="Download file"
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                            onClick={() => removeFile(file.id)}
                            aria-label="Remove file"
                          >
                            <XIcon className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
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
                Province
              </Label>
              <Input
                id="Province"
                name="Province"
                value={formData.Province}
                onChange={handleChange}
                maxLength={60}
                aria-describedby={errors?.Province ? "err-reg-province" : undefined}
                aria-invalid={!!errors?.Province}
                className={`px-3 py-2 h-10 bg-transparent ${
                  errors.Province ? "border-red-500" : ""
                }`}
              />
              {errors.Province && (
                <p id="err-reg-province" role="alert" className="text-[#DF5C5D] text-sm">{errors.Province}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cityTown" className="mb-1 font-medium">
                City/Town
              </Label>
              <Input
                id="cityTown"
                name="cityTown"
                value={formData.cityTown}
                onChange={handleChange}
                maxLength={60}
                aria-describedby={errors?.cityTown ? "err-regCityTown" : undefined}
                aria-invalid={!!errors?.cityTown}
                className={`px-3 py-2 h-10 bg-transparent ${
                  errors.cityTown ? "border-red-500" : ""
                }`}
              />
              {errors.cityTown && (
                <p id="err-regCityTown" role="alert" className="text-[#DF5C5D] text-sm">{errors.cityTown}</p>
              )}
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
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`px-3 py-2 h-10 bg-transparent ${
                  errors.username ? "border-red-500" : ""
                }`}
              />
              {errors.username && (
                <p className="text-[#DF5C5D] text-sm">{errors.username}</p>
              )}
            </div>

            <div className="space-y-4 pt-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-[20px] font-bold">Create New Password</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Change your password to strengthen account security
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="currentPassword" className="mb-1 font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    placeholder="Enter current password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    aria-describedby={
                      errors?.currentPassword ? "err-currentPassword" : undefined
                    }
                    aria-invalid={!!errors?.currentPassword}
                    className={`px-3 py-2 h-10 bg-transparent pr-10 ${
                      errors.currentPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p id="err-currentPassword" role="alert" className="text-[#DF5C5D] text-sm">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="newPassword" className="mb-1 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    placeholder="Enter new password"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    aria-describedby={
                      errors?.newPassword ? "err-newPassword" : undefined
                    }
                    aria-invalid={!!errors?.newPassword}
                    className={`px-3 py-2 h-10 bg-transparent pr-10 ${
                      errors.newPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword ? "Hide new password" : "Show new password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p id="err-newPassword" role="alert" className="text-[#DF5C5D] text-sm">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword" className="mb-1 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter new password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-describedby={
                      errors?.confirmPassword ? "err-confirmPassword" : undefined
                    }
                    aria-invalid={!!errors?.confirmPassword}
                    className={`px-3 py-2 h-10 bg-transparent pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="err-confirmPassword" role="alert" className="text-[#DF5C5D] text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        <div className="flex justify-end">
          <Button type="submit" className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90">
            Save Changes
          </Button>
        </div>
      </form>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
          </DialogHeader>
          <div>
            Would you like to confirm and update the current information?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DF5C5D] text-white"
              onClick={handleConfirmSubmit}
            >
              Yes, Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditUserPage;
