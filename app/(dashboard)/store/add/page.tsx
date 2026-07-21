"use client";

import { Tag } from "emblor";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useRef, useMemo } from "react";
import { PageHeader } from "../components/page-header";
import { useStore } from "../store-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

import { useUserControllerFindAllQuery } from "@/Redux/Services/userApiService";
import { useStoreForm } from "./Context";

import { format, parse } from "date-fns";

function to12Hour(time24: string) {
  if (!time24) return "";
  const parsed = parse(time24, "HH:mm", new Date());
  if (isNaN(parsed.getTime())) return "";
  return format(parsed, "h:mm a");
}

function to24Hour(time12: string) {
  if (!time12) return "";
  try {
    const parsed = parse(time12, "h:mm a", new Date());
    if (isNaN(parsed.getTime())) return "";
    return format(parsed, "HH:mm");
  } catch {
    return "";
  }
}

const AddStorePage = () => {
  const router = useRouter();
  const cashierDropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const id = useId();
  const { addStore } = useStore();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tempTags, setTempTags] = useState<Tag[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, setFormData } = useStoreForm();
  const [cashierPage, setCashierPage] = useState(1);
  const [showLeftEllipsis, setShowLeftEllipsis] = useState(false);
  const [showRightEllipsis, setShowRightEllipsis] = useState(false);
  const [allCashiers, setAllCashiers] = useState<Tag[]>([]);
  const [hasShadow, setHasShadow] = useState(false);
  const [cashierSearch, setCashierSearch] = useState("");
  
  const { data: cashiersData } = useUserControllerFindAllQuery({
    page: cashierPage,
    limit: 10,
    search: undefined,
    userType: 3,
  });

  // sort cashier alphabetically (case-insensitive)
  const sortedCashiers = useMemo(() => {
    return [...allCashiers].sort((a, b) =>
      a.text.toLowerCase().localeCompare(b.text.toLowerCase())
    );
  }, [allCashiers]);

  // filter (search)
  const filteredCashiers = useMemo(() => {
    if (!cashierSearch.trim()) return sortedCashiers;
    return sortedCashiers.filter(c =>
      c.text.toLowerCase().includes(cashierSearch.trim().toLowerCase())
    );
  }, [cashierSearch, sortedCashiers]);

  // const cashierTotalPages = cashiersData?.response.body.pagination.totalPages;
  // const cashiers =
  //   cashiersData?.response.body.content.map((cashier) => ({
  //     id: cashier._id,
  //     name: `${cashier.firstName} ${cashier.lastName}`,
  //     role: cashier.userType,
  //   })) || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cashierDropdownRef.current &&
        !cashierDropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (cashiersData?.response?.body?.content) {
      const newCashiers: Tag[] = cashiersData.response.body.content.map(
        (cashier: any) => ({
          id: cashier._id,
          text: `${cashier.firstName} ${cashier.lastName}`,
        })
      );
      setAllCashiers((prev) => {
        // Avoid duplicates
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...newCashiers.filter((c) => !ids.has(c.id))];
      });
    }
  }, [cashiersData]);

  // const filteredCashiers = cashiers.filter(
  //   (cashier) =>
  //     cashier.role.toLowerCase() === "cashier" &&
  //     cashier.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  useEffect(() => {
    setMounted(true);
    const step = searchParams.get("step");
    if (step) {
      setCurrentStep(parseInt(step));
    }
  }, [searchParams]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cashiers: tags.map((tag) => ({
        id: tag.id,
        name: tag.text,
      })),
    }));
  }, [tags]);

  useEffect(() => {
    const handleScroll = () => {
        setHasShadow(window.scrollY > 2); 
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = () => {
    if (isFormValid()) {
      const newStore = {
        id: Date.now().toString(), // Generate a unique ID
        name: formData.name,
        location: formData.location,
        openingTime: to12Hour(formData.openingTime),
        closingTime: to12Hour(formData.closingTime),
      };
      addStore(newStore);
      router.push("/store");
    }
  };

  const toggleCashier = (cashier: { id: string; name: string }) => {
    setTempTags((prev) => {
      const isSelected = prev.some((tag) => tag.id === cashier.id);
      if (isSelected) {
        return prev.filter((tag) => tag.id !== cashier.id);
      } else {
        return [...prev, { id: cashier.id, text: cashier.name }];
      }
    });
  };

  const handleConfirmSelection = () => {
    setTags(tempTags);
    setOpen(false);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    router.push(`/store/add/step${step}`);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.openingTime !== "" &&
      formData.closingTime !== "" &&
      formData.cashiers.length > 0
    );
  };

  const handleNext = () => {
    if (currentStep < 3 && isFormValid()) {
      handleStepChange(currentStep + 1);
    }
  };

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className="flex flex-col w-full px-4 gap-4">
      <div className="h-8 bg-white z-10 -m-4 sticky top-0"></div>
      <div
          className={`sticky top-8 z-10 outline-white outline-5 bg-white flex flex-col w-full gap-3 transition-shadow duration-200 ${
              hasShadow ? "shadow-lg" : ""
          }`}
          >
        <PageHeader
          title="Add a New Store"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Store Branch", href: "/store" },
            { label: "Add Store", current: true },
          ]}
          showBackButton
        />

        {/* Stepper */}
        <div className="mb-3 flex justify-center">
          <Stepper
            value={1}
            onValueChange={(step) =>
              router.push(step === 1 ? "/store/add" : `/store/add/step${step}`)
            }
          >
            <StepperItem step={1}>
              <StepperTrigger>
                <StepperIndicator isCurrent>1</StepperIndicator>
                <div className="-space-y-0.5">
                  <StepperTitle>Store Information</StepperTitle>
                  <StepperDescription>Enter store details</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
            <StepperItem step={2}>
              <StepperTrigger disabled={!isFormValid()}>
                <StepperIndicator>2</StepperIndicator>
                <div className="-space-y-0.5">
                  <StepperTitle>Choose Products</StepperTitle>
                  <StepperDescription>Select products to add</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
            <StepperItem step={3}>
              <StepperTrigger disabled={!isFormValid()}>
                <StepperIndicator>3</StepperIndicator>
                <div className="-space-y-0.5">
                  <StepperTitle>Verification</StepperTitle>
                  <StepperDescription>Review and confirm</StepperDescription>
                </div>
              </StepperTrigger>
            </StepperItem>
          </Stepper>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="location" className="mb-1 font-medium">
                Location <span className="text-[#DF5C5D]">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Enter store location"
                required
                className="px-3 py-2 h-10"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="mb-1 font-medium">
                Name of the Store <span className="text-[#DF5C5D]">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter store name"
                required
                className="px-3 py-2 h-10"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="openingTime" className="mb-1 font-medium">
                  Opening Time <span className="text-[#DF5C5D]">*</span>
                </Label>
                <div className="relative">
                <Input
                  id="openingTime"
                  type="time"
                  required
                  className="px-3 py-2 h-10 w-[120px]"
                  value={to24Hour(formData.openingTime)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openingTime: to12Hour(e.target.value),
                    }))
                  }
                />

                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="closingTime" className="mb-1 font-medium">
                  Closing Time <span className="text-[#DF5C5D]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="closingTime"
                    type="time"
                    required
                    className="px-3 py-2 h-10 w-[120px]"
                    value={to24Hour(formData.closingTime)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        closingTime: to12Hour(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cashier Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              Cashier Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={id} className="mb-1 font-medium">
                Cashier <span className="text-[#DF5C5D]">*</span>
              </Label>
              <div className="relative mt-2" ref={cashierDropdownRef}>
                {/* Selection Field */}
                <div
                  className={`
                    flex items-center flex-wrap min-h-[40px] w-full px-2 py-1 pr-10 rounded-md border 
                    cursor-pointer bg-white transition-shadow focus-within:ring-2 ring-[#DF5C5D]
                    ${open ? "ring-2 ring-[#DF5C5D]" : ""}
                  `}
                  onClick={() => setOpen(true)}
                  tabIndex={0}
                >
                  {tags.length === 0 && (
                    <span className="text-gray-400 text-sm ml-1 hover:text-[#DF5C5D]">Select cashiers...</span>
                  )}
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center bg-[#DF5C5D]/20 border border-[#DF5C5D] rounded px-2 py-0.5 mr-2 mt-1 mb-1 text-[#DF5C5D] text-xs"
                    >
                      {tag.text}
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={e => {
                          e.stopPropagation();
                          setTags((prev) => prev.filter((t) => t.id !== tag.id));
                        }}
                        className="ml-1 hover:text-[#DF5C5D] focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <ChevronsUpDown className="absolute right-3 hover:text-foreground transition-colors h-4 w-4 text-muted-foreground" />
                </div>

                {/* Dropdown */}
                {open && (
                  <div
                    className="absolute z-50 mt-1 left-0 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto"
                    style={{ 
                      maxHeight: "75px",
                      direction: "rtl",
                      scrollbarGutter: "stable"
                    }}
                  >
                    <div style={{ 
                      direction: "ltr",
                    }}>
                      {filteredCashiers.length === 0 ? (
                        <div className="p-2 text-[14px] text-muted-foreground text-center">
                          No cashier found.
                        </div>
                      ) : (
                        <>
                          {filteredCashiers.slice(0, 2).map((cashier) => {
                            const selected = tags.some((tag) => tag.id === cashier.id);
                            return (
                              <div
                                key={cashier.id}
                                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent ${
                                  selected ? "bg-gray-100" : ""
                                }`}
                                onMouseDown={() => {
                                  if (selected) {
                                    setTags((prev) => prev.filter((t) => t.id !== cashier.id));
                                  } else {
                                    setTags((prev) => [...prev, { id: cashier.id, text: cashier.text }]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selected ? "text-[#DF5C5D] opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-sm">{cashier.text}</span>
                              </div>
                            );
                          })}
                          {/* Scrollable rest */}
                          {filteredCashiers.length > 2 && (
                            <div className="max-h-28 overflow-y-auto">
                              {filteredCashiers.slice(2).map((cashier) => {
                                const selected = tags.some((tag) => tag.id === cashier.id);
                                return (
                                  <div
                                    key={cashier.id}
                                    className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent ${
                                      selected ? "bg-gray-100" : ""
                                    }`}
                                    onMouseDown={() => {
                                      if (selected) {
                                        setTags((prev) => prev.filter((t) => t.id !== cashier.id));
                                      } else {
                                        setTags((prev) => [...prev, { id: cashier.id, text: cashier.text }]);
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selected ? "text-[#DF5C5D] opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="text-sm">{cashier.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 my-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="w-40"
            >
              Previous
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 w-40"
              disabled={!isFormValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 w-40"
              disabled={!isFormValid()}
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddStorePage;
