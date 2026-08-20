"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  Edit,
  Percent,
  Plus,
  Receipt,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// redux chuchu api
import { useBrandControllerFindAllQuery } from "@/Redux/Services/brandApiService";
import { useCategoryControllerFindAllQuery } from "@/Redux/Services/categoryApiService";
import { useStoreControllerFindAllQuery } from "@/Redux/Services/storeApiService";
import {
  useCreateDiscountControllerMutation,
  useCreateVoucherControllerMutation,
  useDiscountControllerFindAllQuery,
  useUpdateDiscountControllerMutation,
  useUpdateVoucherControllerMutation,
  useVoucherControllerFindAllQuery,
} from "@/Redux/Services/voucherApiService";


export interface voucher {
  id: string;
  voucherName: string;
  voucherType: number;
  voucherCategory: number;
  voucherTag: number;
  voucherTagID: VoucherTagId[];
  voucherValue: number;
  voucherCode: string;
  voucherStatus: number;
  voucherStoreBranch: VoucherStoreBranch;
  voucherStartDate: string;
  voucherEndDate: string;
  voucherLimit: number;
}

export interface VoucherTagId {
  productBrand: string;
  _id: string;
}

export interface VoucherStoreBranch {
  storeID: StoreId;
  _id: string;
}

export interface StoreId {
  _id: string;
  storeName: string;
}

const categories = ["Order", "Product", "Group"];
const voucherTags = ["Category", "Brand"];

const VoucherPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [discountPage, setDiscountPage] = useState(1);
  const [vouchersPage, setVouchersPage] = useState(1);
  const [pages, setPages] = useState<number[]>([]);
  const [showLeftEllipsis, setShowLeftEllipsis] = useState(false);
  const [showRightEllipsis, setShowRightEllipsis] = useState(false);
  const [storePage, setStorePage] = useState(1);
  const [activeTab, setActiveTab] = useState("vouchers");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    type: "",
    name: "",
    promoCode: "",
    discountType: "percentage",
    value: 0,
    voucherTag: "",
    category: "",
    startDate: "",
    endDate: "",
    storeBranch: "",
  });
  const [productCategory, setProductCategory] = useState({
    id: "",
    name: "",
  }); // convert natin to sa array of objects or dictionary pag kailangan ng madaming category
  const [productBrand, setProductBrand] = useState({
    id: "",
    name: "",
  }); // same sa category pwedeng iconvert to array of objects or dictionary
  const [selectedBranches, setSelectedBranches] = useState<
    { id: string; name: string }[]
  >([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<{ id: string; text: string }[]>([]);
  const [tempTags, setTempTags] = useState<{ id: string; text: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: voucherData,
    refetch: voucherRefetch,
    isFetching: isVoucherLoading,
  } = useVoucherControllerFindAllQuery({
    page: vouchersPage,
  });
  const {
    data: discountData,
    refetch: discountRefetch,
    isFetching: isDiscountLoading,
  } = useDiscountControllerFindAllQuery({
    page: discountPage,
  });
  const { data: storeData } = useStoreControllerFindAllQuery({
    page: storePage,
  });
  const { data: categoryData } = useCategoryControllerFindAllQuery();
  const { data: brandData } = useBrandControllerFindAllQuery();

  const [createDiscount] = useCreateDiscountControllerMutation();
  const [createVoucher] = useCreateVoucherControllerMutation();
  const [updateDiscount] = useUpdateDiscountControllerMutation();
  const [updateVoucher] = useUpdateVoucherControllerMutation();

  const [showEditVoucherModal, setShowEditVoucherModal] = useState(false);
  const [editVoucherData, setEditVoucherData] = useState<{
    id: string;
    voucherName: string;
    voucherCode: string;
    voucherType: number;
    voucherValue: number;
    voucherLimit: number;
    voucherStatus: number;
    voucherStartDate: string;
    voucherEndDate: string;
    voucherCategory?: number;
    voucherStoreBranch?: any;
    voucherTag?: number;
    voucherTagID?: any;
  } | null>(null);

  const [editTags, setEditTags] = useState<{ id: string; text: string }[]>([]);
  const [editTempTags, setEditTempTags] = useState<{ id: string; text: string }[]>([]);
  const [openEditBranchModal, setOpenEditBranchModal] = useState(false);

  const [showEditDiscountModal, setShowEditDiscountModal] = useState(false);
  const [editDiscountData, setEditDiscountData] = useState<{
    id: string;
    discountName: string;
    discountType: number;
    discountValue: number;
  } | null>(null);


  const categoriesContentApi = categoryData?.response?.body?.content || [];
  const brandContentApi = brandData?.response?.body?.content || [];
  const voucherContentApi = voucherData?.response?.body?.content || [];
  const discountContentApi = discountData?.response?.body?.content || [];

  const totalStorePage = storeData?.response?.body?.pagination?.totalPages || 0;
  const totalVoucherPage =
    voucherData?.response?.body?.pagination?.totalPages || 0;
  const totalDiscountPage =
    discountData?.response?.body?.pagination?.totalPages || 0;

  const extractIdString = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
      if (val._id) return extractIdString(val._id);
      if (val.id) return extractIdString(val.id);
      if (val.$oid) return extractIdString(val.$oid);
      if (typeof val.toString === "function" && val.toString() !== "[object Object]") {
        return val.toString().trim();
      }
    }
    return String(val).trim();
  };

  const storesContent = storeData?.response?.body?.content || [];
  const storesDictionary = storesContent.reduce<Record<string, string>>(
    (acc: any, store: any) => {
      if (store?._id && store?.storeName) {
        acc[store._id] = store.storeName;
      }
      return acc;
    },
    {}
  );

  const branchesArray = Object.entries(storesDictionary).map(([id, name]) => ({
    id,
    name,
  }));

  const vouchersLists = voucherContentApi?.map((voucher: any) => {
    const rawStore = voucher.voucherStoreBranch;
    const storeID = extractIdString(
      rawStore?.storeID ||
      (Array.isArray(rawStore) && rawStore[0]?.storeID) ||
      rawStore
    );
    const storeBranchName =
      (typeof rawStore?.storeID === "object" && rawStore?.storeID?.storeName) ||
      (Array.isArray(rawStore) && typeof rawStore[0]?.storeID === "object" && rawStore[0]?.storeID?.storeName) ||
      storesDictionary[storeID] ||
      "";

    return {
      id: extractIdString(voucher._id || voucher.id || voucher.voucherID || voucher.voucherid),
      name: voucher.voucherName,
      promoCode: voucher.voucherCode,
      discountType: voucher.voucherType === 0 ? "amount" : "percentage",
      value: voucher.voucherValue,
      category: voucher.voucherCategory,
      startDate: voucher.voucherStartDate,
      endDate: voucher.voucherEndDate,
      storeBranch: storeBranchName,
      storeID: storeID,
      voucherStatus: voucher.voucherStatus,
      voucherLimit: voucher.voucherLimit,
      voucherTag: voucher.voucherTag,
      voucherTagID: voucher.voucherTagID,
      rawVoucher: voucher,
    };
  });

  const discountsLists = discountContentApi?.map((discount: any) => ({
    id: discount._id,
    discountName: discount.discountName,
    discountType:
      discount.discountType === 0
        ? "senior"
        : discount.discountType === 1
        ? "pwd"
        : "student",
    discountValue: discount.discountValue,
  }));

  const categoriesLists = categoriesContentApi?.map((category: any) => ({
    id: category._id,
    name: category.categoryName,
  }));

  const brandLists = brandContentApi?.map((brand: any) => ({
    id: brand._id,
    name: brand.brandName,
  }));

  const filteredBranches = branchesArray.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPromo = async () => {
    try {
      if (newPromo.type.toLowerCase() === "discount") {
        const discountPayload = {
          discountName: newPromo.name,
          discountType:
            newPromo.discountType === "senior"
              ? 0
              : newPromo.discountType === "pwd"
              ? 1
              : 2,
          discountValue: newPromo.value,
        };
        const createDiscountResponse = await createDiscount(discountPayload)
          .unwrap()
          .then((discountPayload) => {
            setSuccessMessage("Successfully Created Discount Promo");
            // console.log("Successfully Created Discount Promo", discountPayload);
            discountRefetch();
            setShowAddModal(false);
            setNewPromo({
              type: "",
              name: "",
              promoCode: "",
              discountType: "percentage",
              value: 0,
              category: "",
              voucherTag: "",
              startDate: "",
              endDate: "",
              storeBranch: "",
            });
          })
          .catch((error) => {
            console.error("Error creating discount:", error);
          });
      }
      if (newPromo.type.toLowerCase() === "voucher") {
        const voucherPayload = {
          voucherName: newPromo.name,
          voucherType: newPromo.discountType === "percentage" ? 1 : 0,
          voucherCategory:
            newPromo.category.toLowerCase() === "group"
              ? 2
              : newPromo.category.toLowerCase() === "product"
              ? 1
              : 0,
          voucherTag: newPromo.voucherTag.toLowerCase() === "brand" ? 1 : 0,
          voucherValue: newPromo.value,
          voucherCode: newPromo.promoCode,
          voucherStatus: 1,
          voucherStoreBranch:
            tags.length > 0 ? { storeID: tags[0].id } : { storeID: "" },
          voucherStartDate: newPromo.startDate,
          voucherEndDate: newPromo.endDate,
          voucherLimit: 1000,
          voucherTagID: (() => {
            if (newPromo.voucherTag.toLowerCase() === "category" && productCategory.id) {
              return [{ categoryID: productCategory.id }];
            } else if (newPromo.voucherTag.toLowerCase() === "brand" && productBrand.id) {
              return [{ brandID: productBrand.id }];
            } else {
              return [];
            }
          })(),
        };

        await createVoucher(voucherPayload)
          .unwrap()
          .then(async (voucherPayload) => {
            console.log("Successfully Created Voucher Promo", voucherPayload);
            setSuccessMessage("Successfully Created Voucher Promo");
            setShowAddModal(false);
            setNewPromo({
              type: "",
              name: "",
              promoCode: "",
              discountType: "percentage",
              value: 0,
              category: "",
              voucherTag: "",
              startDate: "",
              endDate: "",
              storeBranch: "",
            });
            await voucherRefetch();
            setVouchersPage(1);
          })
          .catch((error) => {
            console.log("Error creating voucher:", error);
          });
        // Implement the API call to create a voucher here
      }
    } catch {}
  };

  const handleOpenEditVoucher = (voucherItem: any) => {
    let formattedTagID: any = {};
    if (voucherItem.voucherTagID) {
      if (Array.isArray(voucherItem.voucherTagID) && voucherItem.voucherTagID.length > 0) {
        const first = voucherItem.voucherTagID[0];
        if (first.brandID || first.productBrand) {
          const b = first.brandID || first.productBrand;
          const bId = typeof b === "object" ? b._id : b;
          if (bId) formattedTagID = { brandID: bId };
        } else if (first.categoryID || first.productCategory) {
          const c = first.categoryID || first.productCategory;
          const cId = typeof c === "object" ? c._id : c;
          if (cId) formattedTagID = { categoryID: cId };
        }
      } else if (typeof voucherItem.voucherTagID === "object") {
        formattedTagID = voucherItem.voucherTagID;
      }
    }

    const resolvedId = extractIdString(
      voucherItem.id ||
      voucherItem._id ||
      voucherItem.voucherID ||
      voucherItem.rawVoucher?._id ||
      voucherItem.rawVoucher?.id
    );

    const storeIdResolved = extractIdString(
      voucherItem.storeID ||
      voucherItem.voucherStoreBranch?.storeID ||
      voucherItem.voucherStoreBranch ||
      voucherItem.rawVoucher?.voucherStoreBranch?.storeID ||
      voucherItem.rawVoucher?.voucherStoreBranch
    );

    if (storeIdResolved) {
      const storeNameFound = storesDictionary[storeIdResolved] || voucherItem.storeBranch || "Store Branch";
      setEditTags([{ id: storeIdResolved, text: storeNameFound }]);
      setEditTempTags([{ id: storeIdResolved, text: storeNameFound }]);
    } else {
      setEditTags([]);
      setEditTempTags([]);
    }

    setEditVoucherData({
      id: resolvedId,
      voucherName: voucherItem.name || "",
      voucherCode: voucherItem.promoCode || "",
      voucherType: voucherItem.discountType === "percentage" ? 1 : 0,
      voucherValue: voucherItem.value || 0,
      voucherLimit: voucherItem.voucherLimit || 1000,
      voucherStatus: voucherItem.voucherStatus ?? 1,
      voucherStartDate: voucherItem.startDate ? voucherItem.startDate.split("T")[0] : "",
      voucherEndDate: voucherItem.endDate ? voucherItem.endDate.split("T")[0] : "",
      voucherCategory: typeof voucherItem.category === "number" ? voucherItem.category : 0,
      voucherStoreBranch: storeIdResolved ? { storeID: storeIdResolved } : undefined,
      voucherTag: typeof voucherItem.voucherTag === "number" ? voucherItem.voucherTag : 0,
      voucherTagID: formattedTagID,
    });
    setShowEditVoucherModal(true);
  };

  const toggleEditBranch = (branch: { id: string; name: string }) => {
    setEditTempTags((prev) => {
      const exists = prev.find((tag) => tag.id === branch.id);
      if (exists) {
        return prev.filter((tag) => tag.id !== branch.id);
      }
      return [...prev, { id: branch.id, text: branch.name }];
    });
  };

  const handleConfirmEditBranchSelection = () => {
    setEditTags(editTempTags);
    setOpenEditBranchModal(false);
  };

  const handleSaveEditVoucher = async () => {
    if (!editVoucherData) return;
    try {
      const targetId = extractIdString(editVoucherData.id);
      if (!targetId) {
        alert("Error: Voucher ID missing. Please refresh the page and try again.");
        return;
      }

      const storeID = editTags.length > 0 ? editTags[0].id : extractIdString(editVoucherData.voucherStoreBranch?.storeID || editVoucherData.voucherStoreBranch);
      const voucherStoreBranch = storeID ? { storeID } : undefined;

      const brandID = extractIdString(editVoucherData.voucherTagID?.brandID);
      const categoryID = extractIdString(editVoucherData.voucherTagID?.categoryID);
      let voucherTagID: any = [];
      if (brandID) {
        voucherTagID = [{ brandID }];
      } else if (categoryID) {
        voucherTagID = [{ categoryID }];
      }

      await updateVoucher({
        _id: targetId,
        voucherID: targetId,
        id: targetId,
        voucherName: editVoucherData.voucherName,
        voucherCode: editVoucherData.voucherCode,
        voucherType: editVoucherData.voucherType,
        voucherValue: Number(editVoucherData.voucherValue),
        voucherLimit: Number(editVoucherData.voucherLimit),
        voucherStatus: Number(editVoucherData.voucherStatus),
        voucherStartDate: editVoucherData.voucherStartDate,
        voucherEndDate: editVoucherData.voucherEndDate,
        voucherCategory: editVoucherData.voucherCategory,
        voucherStoreBranch,
        voucherTag: editVoucherData.voucherTag,
        voucherTagID,
      }).unwrap();

      setSuccessMessage("Successfully Updated Voucher");
      setShowEditVoucherModal(false);
      await voucherRefetch();
    } catch (error: any) {
      console.log("Error updating voucher details:", error);

      let errorDetails = "";
      if (error?.data) {
        if (typeof error.data === "string") {
          errorDetails = error.data;
        } else if (error.data.errors?.message) {
          const m = error.data.errors.message;
          errorDetails = Array.isArray(m) ? m.join("\n") : String(m);
        } else if (error.data.response?.message) {
          const m = error.data.response.message;
          errorDetails = Array.isArray(m) ? m.join("\n") : String(m);
        } else if (error.data.message) {
          const m = error.data.message;
          errorDetails = Array.isArray(m) ? m.join("\n") : String(m);
        } else if (error.data.error) {
          errorDetails = String(error.data.error);
        } else {
          errorDetails = JSON.stringify(error.data);
        }
      } else if (error?.message) {
        errorDetails = error.message;
      } else {
        errorDetails = JSON.stringify(error);
      }

      alert("API Error: " + errorDetails);
    }
  };

  const handleOpenEditDiscount = (discountItem: any) => {
    setEditDiscountData({
      id: discountItem.id,
      discountName: discountItem.discountName || "",
      discountType:
        discountItem.discountType === "senior"
          ? 0
          : discountItem.discountType === "pwd"
          ? 1
          : 2,
      discountValue: discountItem.discountValue || 0,
    });
    setShowEditDiscountModal(true);
  };

  const handleSaveEditDiscount = async () => {
    if (!editDiscountData) return;
    try {
      await updateDiscount({
        discountID: editDiscountData.id,
        id: editDiscountData.id,
        discountName: editDiscountData.discountName,
        discountType: Number(editDiscountData.discountType),
        discountValue: Number(editDiscountData.discountValue),
      }).unwrap();
      setSuccessMessage("Successfully Updated Discount");
      setShowEditDiscountModal(false);
      discountRefetch();
    } catch (error) {
      console.error("Error updating discount:", error);
    }
  };


  const toggleBranch = (branch: { id: string; name: string }) => {
    setTempTags((prev) => {
      const exists = prev.find((tag) => tag.id === branch.id);
      if (exists) {
        return prev.filter((tag) => tag.id !== branch.id);
      }
      return [...prev, { id: branch.id, text: branch.name }];
    });
  };

  const handleConfirmSelection = () => {
    setTags(tempTags);
    setOpen(false);
  };

  const handleConfirmAndRedirect = () => {
    // router.push("/store");
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleReload = () => {
    voucherRefetch();
    discountRefetch();
  };

  useEffect(() => {
    discountRefetch();
  }, [discountPage]);

  return (
    <div className="flex flex-col w-full p-4 gap-4">
      {successMessage && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-100 border border-green-400 rounded">
          {successMessage}
        </div>
      )}
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 text-[14px]"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-[#DF5C5D] text-[14px] font-medium">
                Promotions
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[24px] font-[700]">Promotions</div>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center justify-between border-b">
        <Tabs
          defaultValue="vouchers"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between">
            <TabsList className="bg-background mb-3 h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
              <TabsTrigger
                value="vouchers"
                className="data-[state=active]:text-[#DF5C5D] data-[state=active]:after:bg-[#DF5C5D] relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <Receipt
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Vouchers
              </TabsTrigger>
              <TabsTrigger
                value="discounts"
                className="data-[state=active]:text-[#DF5C5D] data-[state=active]:after:bg-[#DF5C5D] relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <Percent
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Discounts
              </TabsTrigger>
            </TabsList>
            <Button
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Promo
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Vouchers Tab Content */}
          <TabsContent value="vouchers">
            {/* Vouchers Table */}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-x-0">
                  <TableHead className="w-[80px] border-x-0">No.</TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Name of Voucher
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Promo Code
                  </TableHead>
                  <TableHead className="w-[100px] border-x-0">Value</TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Remaining
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Effective Until
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">Status</TableHead>
                  <TableHead className="w-[150px] border-x-0">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isVoucherLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
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
                ) : (vouchersLists ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <p className="mt-2 mb-2">No vouchers available.</p>
                      <Button
                        variant="outline"
                        className="ml-2 bg-red-600 hover:bg-red-700 text-white hover:text-white"
                        onClick={voucherRefetch}
                      >
                        Reload
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  (vouchersLists ?? []).map((voucher, index) => (
                    <TableRow
                      key={voucher.id}
                      className="hover:bg-gray-50 border-x-0"
                    >
                      <TableCell className="border-x-0">{index + 1}</TableCell>
                      <TableCell className="border-x-0">
                        {voucher.name}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {voucher.promoCode}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {voucher.discountType === "percentage"
                          ? `${voucher.value}%`
                          : formatCurrency(voucher.value)}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {voucher.voucherLimit}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {format(new Date(voucher.endDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {voucher.voucherStatus === 0 ? "Expired" : "Active"}
                      </TableCell>
                      <TableCell className="border-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenEditVoucher(voucher)}
                          title="Edit Voucher"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Discounts Tab Content */}
          <TabsContent value="discounts">
            {/* Discounts Table */}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-x-0">
                  <TableHead className="w-[30px] border-x-0">No.</TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Name of Discount
                  </TableHead>
                  <TableHead className="w-[100px] border-x-0">Value</TableHead>
                  <TableHead className="w-[100px] border-x-0">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDiscountLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
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
                    {(discountsLists ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <p className="mt-2 mb-2">No discounts available.</p>
                          <Button
                            variant="outline"
                            className="ml-2 bg-red-600 hover:bg-red-700 text-white hover:text-white"
                            onClick={handleReload}
                          >
                            Reload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (discountsLists ?? []).map((discount, index) => (
                        <TableRow
                          key={discount.id}
                          className="hover:bg-gray-50 border-x-0"
                        >
                          <TableCell className="border-x-0">
                            {index + 1}
                          </TableCell>
                          <TableCell className="border-x-0">
                            {discount.discountName}
                          </TableCell>
                          <TableCell className="border-x-0">
                            {discount.discountValue}%
                          </TableCell>
                          <TableCell className="border-x-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleOpenEditDiscount(discount)}
                              title="Edit Discount"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TabsContent>

        </Tabs>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <div className="text-sm text-gray-500 mb-2">
          Showing {(vouchersLists ?? []).length > 0 ? discountPage - 1 : 0} to{" "}
          {Math.min(discountPage, (vouchersLists ?? []).length)} of{" "}
          {(vouchersLists ?? []).length} entries
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() =>
                  activeTab === "vouchers"
                    ? setVouchersPage((prev) => prev - 1)
                    : setDiscountPage((prev) => prev - 1)
                }
                aria-disabled={
                  activeTab === "vouchers"
                    ? vouchersPage === 1
                    : discountPage === 1
                }
              />
            </PaginationItem>

            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {Array.from(
              {
                length:
                  activeTab === "vouchers"
                    ? totalVoucherPage
                    : totalDiscountPage,
              },
              (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`px-3 py-1 rounded-md ${
                      discountPage === pageNumber
                        ? "bg-red-600 text-white font-medium"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() =>
                      activeTab === "vouchers"
                        ? setVouchersPage(pageNumber)
                        : setDiscountPage(pageNumber)
                    }
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}

            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() =>
                  activeTab === "vouchers"
                    ? setVouchersPage((prev) => prev + 1)
                    : setDiscountPage((prev) => prev + 1)
                }
                aria-disabled={
                  activeTab === "vouchers"
                    ? vouchersPage === totalVoucherPage
                    : discountPage === totalDiscountPage
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col overflow-hidden p-6">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle>Add New Promotion</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2 overflow-y-auto pr-1 flex-1">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Promo Type</Label>
                  <Select
                    value={newPromo.type}
                    onValueChange={(value) =>
                      setNewPromo((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select promo type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voucher">Voucher</SelectItem>
                      <SelectItem value="discount">Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Name of Promotion</Label>
                  <Input
                    id="name"
                    value={newPromo.name}
                    onChange={(e) =>
                      setNewPromo((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter promotion name"
                    // disabled={newPromo.type.toLowerCase() === "discount"}
                  />
                </div>
                {newPromo.type.toLowerCase() === "voucher" ? (
                  newPromo.category.toLowerCase() === "product" ||
                  newPromo.category.toLowerCase() === "group" ? (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="tag"
                        className={
                          newPromo.type.toLowerCase() === "discount" ||
                          newPromo.category.toLowerCase() === "product"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        Tag
                      </Label>
                      <Select
                        value={newPromo.voucherTag}
                        onValueChange={(value) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            voucherTag: value,
                          }))
                        }
                        disabled={
                          newPromo.type.toLowerCase() === "discount" ||
                          newPromo.category.toLowerCase() === "product"
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {voucherTags.map((voucherTag) => (
                            <SelectItem key={voucherTag} value={voucherTag}>
                              {voucherTag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null
                ) : null}

                {newPromo.type.toLowerCase() === "voucher" ? (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="promoCode"
                      className={
                        newPromo.type.toLowerCase() === "discount"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    >
                      Promo Code
                    </Label>
                    <Input
                      id="promoCode"
                      value={newPromo.promoCode}
                      onChange={(e) =>
                        setNewPromo((prev) => ({
                          ...prev,
                          promoCode: e.target.value,
                        }))
                      }
                      placeholder="Enter promo code"
                      disabled={newPromo.type.toLowerCase() === "discount"}
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {newPromo.type.toLowerCase() === "voucher" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={newPromo.discountType}
                        onValueChange={(value) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            discountType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={newPromo.discountType}
                        onValueChange={(value) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            discountType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior">SENIOR CITIZEN</SelectItem>
                          <SelectItem value="pwd">PWD</SelectItem>
                          <SelectItem value="student">STUDENT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newPromo.value}
                      onChange={(e) =>
                        setNewPromo((prev) => ({
                          ...prev,
                          value: Number(e.target.value),
                        }))
                      }
                      placeholder={
                        newPromo.discountType === "percentage"
                          ? "Enter percentage"
                          : "Enter amount"
                      }
                    />
                  </div>
                </div>

                {newPromo.type.toLowerCase() === "voucher" ? (
                  <div className="grid gap-2">
                    <Label
                      htmlFor="category"
                      className={
                        newPromo.type.toLowerCase() === "discount"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    >
                      Category
                    </Label>
                    <Select
                      value={newPromo.category}
                      onValueChange={(value) =>
                        setNewPromo((prev) => ({ ...prev, category: value }))
                      }
                      disabled={newPromo.type.toLowerCase() === "discount"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {newPromo.type.toLowerCase() === "voucher" ? (
                  newPromo.category.toLowerCase() === "group" &&
                  newPromo.voucherTag.toLowerCase() === "category" ? (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="category"
                        className={
                          newPromo.type.toLowerCase() === "discount"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        Products Category
                      </Label>
                      {/* hindi pa gumagana ang mga onvaluechange and select chuchu */}
                      <Select
                        value={productCategory.name}
                        onValueChange={(value) => {
                          const selected = (categoriesLists ?? []).find(
                            (category) => category.name === value
                          );
                          setProductCategory(
                            selected
                              ? { id: selected.id, name: selected.name }
                              : { id: "", name: "" }
                          );
                        }}
                        disabled={newPromo.type.toLowerCase() === "discount"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Products Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categoriesLists ?? []).map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : newPromo.category.toLowerCase() === "group" &&
                    newPromo.voucherTag.toLowerCase() === "brand" ? (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="category"
                        className={
                          newPromo.type.toLowerCase() === "discount"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        Brand
                      </Label>
                      <Select
                        value={productBrand.name}
                        onValueChange={(value) => {
                          const selected = (brandLists ?? []).find(
                            (brand) => brand.name === value
                          );
                          setProductBrand(
                            selected
                              ? { id: selected.id, name: selected.name }
                              : { id: "", name: "" }
                          );
                        }}
                        disabled={newPromo.type.toLowerCase() === "discount"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {(brandLists ?? []).map((brand) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : newPromo.category.toLowerCase() === "product" ? (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="category"
                        className={
                          newPromo.type.toLowerCase() === "discount"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        Product
                      </Label>
                      <Select
                        value={newPromo.category}
                        onValueChange={(value) =>
                          setNewPromo((prev) => ({ ...prev, category: value }))
                        }
                        disabled={newPromo.type.toLowerCase() === "discount"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : newPromo.category.toLowerCase() === "group" ? (
                    <div className="grid gap-2">
                      <Label className={"opacity-50 cursor-not-allowed"}>
                        Select Tag
                      </Label>
                      <Select disabled={true}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Tag First" />
                        </SelectTrigger>
                      </Select>
                    </div>
                  ) : null
                ) : null}

                {/* Date Selection */}
                {newPromo.type.toLowerCase() === "voucher" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="startDate"
                        className={
                          newPromo.type.toLowerCase() === "discount"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newPromo.startDate}
                        onChange={(e) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        disabled={newPromo.type.toLowerCase() === "discount"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="endDate"
                        className={
                          newPromo.type.toLowerCase() === "discount"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newPromo.endDate}
                        onChange={(e) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        disabled={newPromo.type.toLowerCase() === "discount"}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Store Branch Selection */}
            {newPromo.type.toLowerCase() === "voucher" ? (
              <div className="space-y-2">
                {(() => {
                  const isDiscount = newPromo.type.toLowerCase() === "discount";
                  const labelClassName =
                    "mb-1 font-medium" +
                    (isDiscount ? " opacity-50 cursor-not-allowed" : "");
                  return (
                    <Label className={labelClassName}>
                      Store Branch <span className="text-[#DF5C5D]">*</span>
                    </Label>
                  );
                })()}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Select store branches"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10"
                      onClick={() => setOpen(true)}
                      disabled={newPromo.type.toLowerCase() === "discount"}
                    />
                    <ChevronsUpDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setOpen(!open)}
                    />
                  </div>
                  {open && (
                    <div className="fixed inset-0 z-50">
                      <div
                        className="absolute top-0 left-0 w-full h-full bg-black/20"
                        onClick={() => setOpen(false)}
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-lg shadow-lg">
                        <div className="p-4">
                          <div className="mb-4">
                            <Input
                              type="text"
                              placeholder="Search store branches..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="max-h-[300px] overflow-auto rounded-md border">
                            {filteredBranches.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No store branch found.
                              </div>
                            ) : (
                              filteredBranches.map((branch) => (
                                <div
                                  key={branch.id}
                                  className="flex items-center p-2 hover:bg-accent cursor-pointer transition-colors"
                                  onClick={() => toggleBranch(branch)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      tempTags.some(
                                        (tag) => tag.id === branch.id
                                      )
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span>{branch.name}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex justify-end mt-4 pt-4 border-t">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                                    onClick={() => setStorePage(storePage - 1)}
                                    aria-disabled={storePage === 1}
                                  />
                                </PaginationItem>

                                {showLeftEllipsis && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}

                                {Array.from(
                                  { length: totalStorePage ?? 0 },
                                  (_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                      <button
                                        type="button"
                                        key={pageNumber}
                                        className={`px-3 py-1 rounded-md ${
                                          storePage === pageNumber
                                            ? "bg-red-600 text-white font-medium"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                        }`}
                                        onClick={() => setStorePage(pageNumber)}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  }
                                )}

                                {showRightEllipsis && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}

                                <PaginationItem>
                                  <PaginationNext
                                    className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                                    onClick={() => setStorePage(storePage + 1)}
                                    aria-disabled={storePage === totalStorePage}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                            <Button
                              type="button"
                              onClick={handleConfirmSelection}
                              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                            >
                              OK
                            </Button>
                          </div>
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

          <DialogFooter className="pt-3 border-t mt-auto shrink-0">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPromo}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            >
              Add Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to confirm these store branch selections?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAndRedirect}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            >
              Yes, Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Voucher Modal */}

      <Dialog open={showEditVoucherModal} onOpenChange={setShowEditVoucherModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden p-6">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>
          {editVoucherData && (
            <div className="space-y-4 py-2 overflow-y-auto pr-1 flex-1">
              <div className="grid gap-2">
                <Label htmlFor="editVoucherName">Voucher Name</Label>
                <Input
                  id="editVoucherName"
                  value={editVoucherData.voucherName}
                  onChange={(e) =>
                    setEditVoucherData((prev) =>
                      prev ? { ...prev, voucherName: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherCode">Promo Code</Label>
                  <Input
                    id="editVoucherCode"
                    value={editVoucherData.voucherCode}
                    onChange={(e) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherCode: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherType">Value Type</Label>
                  <Select
                    value={editVoucherData.voucherType === 1 ? "percentage" : "fixed"}
                    onValueChange={(val) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherType: val === "percentage" ? 1 : 0 } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₱)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherValue">Value</Label>
                  <Input
                    id="editVoucherValue"
                    type="number"
                    value={editVoucherData.voucherValue}
                    onChange={(e) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherValue: parseFloat(e.target.value) || 0 } : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherLimit">Limit / Quantity</Label>
                  <Input
                    id="editVoucherLimit"
                    type="number"
                    value={editVoucherData.voucherLimit}
                    onChange={(e) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherLimit: parseInt(e.target.value, 10) || 0 } : null
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherStartDate">Start Date</Label>
                  <Input
                    id="editVoucherStartDate"
                    type="date"
                    value={editVoucherData.voucherStartDate}
                    onChange={(e) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherStartDate: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherEndDate">End Date</Label>
                  <Input
                    id="editVoucherEndDate"
                    type="date"
                    value={editVoucherData.voucherEndDate}
                    onChange={(e) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherEndDate: e.target.value } : null
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editVoucherStatus">Status</Label>
                  <Select
                    value={editVoucherData.voucherStatus === 1 ? "1" : "0"}
                    onValueChange={(val) =>
                      setEditVoucherData((prev) =>
                        prev ? { ...prev, voucherStatus: parseInt(val, 10) } : null
                      )
                    }
                  >
                    <SelectTrigger id="editVoucherStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Expired / Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="editVoucherBranch">Store Branch Target</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Select store branches"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 cursor-pointer"
                      onClick={() => setOpenEditBranchModal(true)}
                    />
                    <ChevronsUpDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setOpenEditBranchModal(!openEditBranchModal)}
                    />
                  </div>
                  {openEditBranchModal && (
                    <div className="fixed inset-0 z-50">
                      <div
                        className="absolute top-0 left-0 w-full h-full bg-black/20"
                        onClick={() => setOpenEditBranchModal(false)}
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-lg shadow-lg">
                        <div className="p-4">
                          <div className="mb-4">
                            <Input
                              type="text"
                              placeholder="Search store branches..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="max-h-[300px] overflow-auto rounded-md border">
                            {filteredBranches.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No store branch found.
                              </div>
                            ) : (
                              filteredBranches.map((branch) => (
                                <div
                                  key={branch.id}
                                  className="flex items-center p-2 hover:bg-accent cursor-pointer transition-colors"
                                  onClick={() => toggleEditBranch(branch)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      editTempTags.some(
                                        (tag) => tag.id === branch.id
                                      )
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span>{branch.name}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex justify-end mt-4 pt-4 border-t">
                            <Button
                              type="button"
                              onClick={handleConfirmEditBranchSelection}
                              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {editTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="flex items-center gap-2 px-2 py-1 bg-[#DF5C5D]/20 hover:bg-[#DF5C5D]/30 transition-colors border-[#DF5C5D]"
                        >
                          <span className="text-[12px] text-[#DF5C5D] ml-1">
                            {tag.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditTags((prev) =>
                                prev.filter((t) => t.id !== tag.id)
                              );
                              setEditTempTags((prev) =>
                                prev.filter((t) => t.id !== tag.id)
                              );
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
            </div>
          )}
          <DialogFooter className="pt-3 border-t mt-auto shrink-0">
            <Button variant="outline" onClick={() => setShowEditVoucherModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
              onClick={handleSaveEditVoucher}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Discount Modal */}
      <Dialog open={showEditDiscountModal} onOpenChange={setShowEditDiscountModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>
          {editDiscountData && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editDiscountName">Discount Name</Label>
                <Input
                  id="editDiscountName"
                  value={editDiscountData.discountName}
                  onChange={(e) =>
                    setEditDiscountData((prev) =>
                      prev ? { ...prev, discountName: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDiscountType">Discount Type</Label>
                <Select
                  value={editDiscountData.discountType.toString()}
                  onValueChange={(val) =>
                    setEditDiscountData((prev) =>
                      prev ? { ...prev, discountType: parseInt(val, 10) } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">SENIOR CITIZEN</SelectItem>
                    <SelectItem value="1">PWD</SelectItem>
                    <SelectItem value="2">STUDENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDiscountValue">Discount Value (%)</Label>
                <Input
                  id="editDiscountValue"
                  type="number"
                  value={editDiscountData.discountValue}
                  onChange={(e) =>
                    setEditDiscountData((prev) =>
                      prev ? { ...prev, discountValue: parseFloat(e.target.value) || 0 } : null
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDiscountModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
              onClick={handleSaveEditDiscount}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default VoucherPage;
