"use client";

import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// RTK Query hooks
import {
  useCategoryControllerFindAllQuery,
  useAddCategoryControllerMutation,
  useEditCategoryControllerMutation,
  useDeleteCategoryControllerMutation,
} from "@/Redux/Services/categoryApiService";
import {
  useBrandControllerFindAllQuery,
  useAddBrandControllerMutation,
  useEditBrandControllerMutation,
  useDeleteBrandControllerMutation,
} from "@/Redux/Services/brandApiService";
import { 
  useProductsControllerFindAllQuery 
} from "@/Redux/Services/productsAPpiService";

interface CategoryBrandDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryBrandDrawer({
  open,
  onOpenChange,
}: CategoryBrandDrawerProps) {
  // Tab state
  const [tab, setTab] = useState<"category" | "brand">("category");

  // --- CATEGORY API HOOKS ---
  const { data: categoriesData, refetch: refetchCategories } = useCategoryControllerFindAllQuery(undefined, { skip: !open });
  const [addCategory] = useAddCategoryControllerMutation();
  const [editCategory] = useEditCategoryControllerMutation();
  const [deleteCategory] = useDeleteCategoryControllerMutation();

  // --- BRAND API HOOKS ---
  const { data: brandsData, refetch: refetchBrands } = useBrandControllerFindAllQuery(undefined, { skip: !open });
  const [addBrand] = useAddBrandControllerMutation();
  const [editBrand] = useEditBrandControllerMutation();
  const [deleteBrand] = useDeleteBrandControllerMutation();

  // --- LOCAL UI STATE ---
  const [categoryInput, setCategoryInput] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandEditValue, setBrandEditValue] = useState("");
  const [openMenuIdx, setOpenMenuIdx] = useState<{type: "category"|"brand", id: string}|null>(null);

  // --- DATA ARRAYS ---
  const categories = (categoriesData?.response?.body?.content as { _id: string, categoryName: string }[]) || [];
  const brands = (brandsData?.response?.body?.content as { _id: string, brandName: string }[]) || [];

  // --- CLICK OUTSIDE EDIT/DELETE MENU ---
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!openMenuIdx) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIdx]);
  
  // --- DISABLE DELETE IF IN USE ---
  const { data: productsData } = useProductsControllerFindAllQuery(
    { limit: 10000, pageNumber: 1, search: undefined }, 
    { skip: !open }
  );

  const products = (productsData?.response?.body?.content ?? []) as any[];

  function isCategoryInUse(categoryId: string) {
    return products.some(p => p.categoriesID?._id === categoryId);
  }


  function isBrandInUse(brandId: string) {
    return products.some(
      (p) =>
        p.productBrandID && 
        typeof p.productBrandID === "object" && 
        p.productBrandID._id === brandId
    );
  }

  // --- CRUD HANDLERS ---
  const handleAddCategory = async () => {
    const value = categoryInput.trim();
    if (!value) return;
    try {
      await addCategory({ categoryName: value }).unwrap();
      setCategoryInput("");
      refetchCategories();
    } catch {}
  };
  const handleEditCategory = async (id: string) => {
    const value = categoryEditValue.trim();
    if (!value) return;
    try {
      await editCategory({ categoryID: id, categoryName: value }).unwrap();
      setEditingCategoryId(null);
      setCategoryEditValue("");
      refetchCategories();
    } catch {}
  };
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory({ categoryID: id }).unwrap();
      setOpenMenuIdx(null);
      refetchCategories();
    } catch {}
  };

  const handleAddBrand = async () => {
    const value = brandInput.trim();
    if (!value) return;
    try {
      await addBrand({ brandName: value }).unwrap();
      setBrandInput("");
      refetchBrands();
    } catch {}
  };
  const handleEditBrand = async (id: string) => {
    const value = brandEditValue.trim();
    if (!value) return;
    try {
      await editBrand({ brandID: id, brandName: value }).unwrap();
      setEditingBrandId(null);
      setBrandEditValue("");
      refetchBrands();
    } catch {}
  };
  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand({ brandID: id }).unwrap();
      setOpenMenuIdx(null);
      refetchBrands();
    } catch {}
  };

  // --- RENDER LISTS ---
  const renderList = (items: any[], type: "category" | "brand") =>
    items.map((item) => {
      const id = item._id;
      const name = type === "category" ? item.categoryName : item.brandName;
      const isEditing = type === "category" ? editingCategoryId === id : editingBrandId === id;
      const editValue = type === "category" ? categoryEditValue : brandEditValue;
      const inUse =
        type === "category"
          ? isCategoryInUse(id)
          : isBrandInUse(id);

      return (
        <div
          className="flex items-center text-sm border rounded-sm px-4 py-2 mb-3 bg-white relative group "
          key={id}
        >
          {isEditing ? (
            <Input
              value={editValue}
              autoFocus
              onChange={e => type === "category"
                ? setCategoryEditValue(e.target.value)
                : setBrandEditValue(e.target.value)
              }
              onBlur={() => type === "category"
                ? handleEditCategory(id)
                : handleEditBrand(id)
              }
              onKeyDown={e => {
                if (e.key === "Enter") type === "category"
                  ? handleEditCategory(id)
                  : handleEditBrand(id);
                if (e.key === "Escape") type === "category"
                  ? setEditingCategoryId(null)
                  : setEditingBrandId(null);
              }}
              className="text-sm border-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-[#DF5C5D] focus-visible:rounded-none focus:ring-0 focus:outline-none p-0 h-7 bg-transparent shadow-none focus-visible:text-[#DF5C5D] "
              style={{ minWidth: "70px" }}
              maxLength={30}
            />
          ) : (
            <span className="flex-1 text-md">{name}</span>
          )}
          {/* Box Menu -------------------------------------------------------------------*/}
            <div className="ml-2 relative">
              <button
                className="p-1 rounded hover:bg-gray-100 hover:rounded-2xl"
                onClick={() => setOpenMenuIdx({type, id})}
                tabIndex={0}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {openMenuIdx && openMenuIdx.type === type && openMenuIdx.id === id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 z-10 min-w-[90px] bg-white border rounded-lg shadow-md"
                >
                  <button
                    className="flex items-center px-3 py-2 text-sm w-full hover:bg-gray-100"
                    onClick={() => {
                      type === "category"
                        ? (setEditingCategoryId(id), setCategoryEditValue(name))
                        : (setEditingBrandId(id), setBrandEditValue(name));
                      setOpenMenuIdx(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className={`flex items-center px-3 py-2 text-sm w-full hover:bg-red-50 ${
                      inUse ? "text-gray-400 cursor-not-allowed opacity-50" : "text-red-600"
                    }`}
                    onClick={() => {
                      if (!inUse) {
                        type === "category"
                          ? handleDeleteCategory(id)
                          : handleDeleteBrand(id);
                      }
                    }}
                    disabled={inUse}
                    title={
                      inUse
                        ? type === "category"
                          ? "Cannot delete: Category is used by products."
                          : "Cannot delete: Brand is used by products."
                        : ""
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          {/* ----------------------------------------------------------------------------*/}
        </div>
      );
    });

  // --- RENDER ADD NEW ---
  const renderAddNew = (type: "category" | "brand") => (
    <div className="flex items-center border rounded-sm px-4 py-2 mb-3 cursor-pointer bg-white hover:bg-[#fff8f8] group transition">
      <span className="text-[#DF5C5D] text-lg  mr-2">+</span>
      {type === "category" ? (
        <Input
          placeholder="New Category"
          className="text-sm border-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-[#DF5C5D] focus-visible:rounded-none focus:ring-0 focus:outline-none p-0 h-7 bg-transparent shadow-none ml-3"
          value={categoryInput}
          onChange={e => setCategoryInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleAddCategory();
          }}
          maxLength={30}
          onBlur={handleAddCategory}
        />
      ) : (
        <Input
          placeholder="New Brand"
          className="text-sm border-none focus-visible:border-0 focus-visible:ring-0 placeholder:text-[#DF5C5D] focus-visible:rounded-none focus:ring-0 focus:outline-none p-0 h-7 bg-transparent shadow-none ml-3"
          value={brandInput}
          onChange={e => setBrandInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleAddBrand();
          }}
          maxLength={30}
          onBlur={handleAddBrand}
        />
      )}
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={open => { setTab("category"); onOpenChange(open); }}>
      <DrawerContent className="max-w-md ml-auto h-full flex flex-col p-0 bg-[#fff]" open={open}>
        {/* Header with tabs and close */}
        <DrawerTitle className="sr-only">Settings Drawer</DrawerTitle>
        <div className="flex items-center border-b p-0 h-12 relative">
          <div className="flex justify-center items-center w-full bg-gray-100 shadow-sm">
            <div className="flex-6/7 justify-center items-center w-full bg-gray-100">
              <Tabs
                value={tab}
                onValueChange={v => setTab(v as "category" | "brand")}
                className="w-full bg-gray-100"
              >
                <TabsList className="w-full flex -p-1 bg-gray-100 h-full border-b-0">
                  <TabsTrigger value="category" className="flex-1 bg-gray-100 text-sm rounded-none h-full pt-7 pb-3 border-b-4 data-[state=active]:border-[#DF5C5D] data-[state=active]:bg-gray-100 data-[state=active]:shadow-none border-transparent text-black font-medium transition-all">
                    Add Category
                  </TabsTrigger>
                  <TabsTrigger value="brand" className="flex-1 bg-gray-100 text-sm rounded-none h-full pt-7 pb-3 border-b-4 data-[state=active]:border-[#DF5C5D] data-[state=active]:bg-gray-100 data-[state=active]:shadow-none border-transparent text-black font-medium transition-all">
                    Add Brand
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1/7 pt-10">
              <DrawerClose asChild className="right-3 top-2">
                <button className="text-gray-400 hover:text-gray-700 focus:outline-none">
                  <X className="w-6 h-6" />
                </button>
              </DrawerClose>
            </div>
          </div>
        </div>
        {/* Tab panels */}
        <div className="px-7 py-4 flex-1 overflow-y-auto">
          <Tabs value={tab}>
            <TabsContent value="category" className="focus:outline-none">
              {renderAddNew("category")}
              {renderList(categories, "category")}
            </TabsContent>
            <TabsContent value="brand" className="focus:outline-none">
              {renderAddNew("brand")}
              {renderList(brands, "brand")}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
