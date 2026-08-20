"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Search, ChevronLeft, ChevronRight, Settings, Trash2 } from "lucide-react";
import { CategoryBrandDrawer } from "./category-brand-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Redux hooks
import {
  useAddProductControllerMutation,
  useEditProductsMutation,
  useProductsControllerFindAllQuery,
  useDeleteProductMutation
} from "@/Redux/Services/productsAPpiService";
import {
  useEditStoreMutation,
  useStoreControllerFindAllQuery,
} from "@/Redux/Services/storeApiService";

// Product type
interface Product {
  id: number;
  name: string;
  description: string;
  code: string;
  price: number;
  sellingPrice: number;
  stocks: number;
  image: string;
  category: string | undefined;
  status: boolean;
  brand?: string;
  vat?: number;
}

const ProductsPage = () => {
  const router = useRouter();

  // --- State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Product & { newStatus?: boolean } | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [hasError, setHasError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasShadow, setHasShadow] = useState(false);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // --- Redux Queries ---
  const {
    data: productsData,
    refetch: refetchProducts,
    isLoading: productsDataIsLoading,
    isFetching: productsDataIsFetching,
    isError,
  } = useProductsControllerFindAllQuery({
    pageNumber: currentPage,
    limit: 10,
    search: searchQuery.length > 0 ? searchQuery : undefined,
  });

  const [editProduct] = useEditProductsMutation();
  const [addProduct] = useAddProductControllerMutation();
  const [editStore] = useEditStoreMutation();
  const { data: allStoresData } = useStoreControllerFindAllQuery({ limit: 100 });

  // --- Products Mapping ---
  const products: Product[] =
    productsData?.response?.body?.content?.map((product: any): Product => ({
      id: product?._id || 0,
      name: product?.productName || "",
      description: product?.productDescription || "",
      code: product?.productCode || "",
      price: product?.productPrice ?? 0,
      sellingPrice: product?.productSellingPrice ?? 0,
      stocks: product?.productQuantity ?? 0,
      image: product?.productImage || "",
      category: product?.categoriesID?.categoryName || "Uncategorized", 
      brand: product?.productBrandID?.brandName || "Unbranded", 
      status: product?.productStatus ?? false,
      vat: product?.productVatOrNoVat ?? 0,
    })) || [];

  // --- Category & Sorting Filters ---
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  const categoriesList = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((cat): cat is string => Boolean(cat) && cat !== "Uncategorized")
    )
  ).sort();

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    return (product.category || "").toLowerCase() === selectedCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "a-z") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "z-a") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "price-low-high") {
      return (a.price ?? 0) - (b.price ?? 0);
    }
    if (sortBy === "price-high-low") {
      return (b.price ?? 0) - (a.price ?? 0);
    }
    return 0;
  });

  // --- Effects ---
  // Refetch on page change
  useEffect(() => {
    refetchProducts();
  }, [currentPage, refetchProducts]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => setSearchQuery(tempSearchQuery), 500);
    return () => clearTimeout(handler);
  }, [tempSearchQuery]);

  // Auto-hide error/success messages
  useEffect(() => {
    if (hasError) {
      const timeout = setTimeout(() => setHasError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [hasError]);
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  useEffect(() => {
      const handleScroll = () => {
          setHasShadow(window.scrollY > 2); 
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Handlers ---
  const handleStatusToggle = (product: Product) => {
    setProductToToggle({
      ...product,
      newStatus: !product.status
    });
    setShowStatusConfirm(true);
  };

  const confirmStatusToggle = async () => {
    if (!productToToggle) return;
    try {
      await editProduct({
        productID: productToToggle.id?.toString() ?? "",
        productStatus: productToToggle.newStatus ? 1 : 0,
        productName: productToToggle.name,
        productDescription: productToToggle.description,
        productQuantity: productToToggle.stocks,
        productSellingPrice: productToToggle.sellingPrice,
        productPrice: productToToggle.price,
        productImage: productToToggle.image,
        productHasVat: productToToggle.vat === 1
      }).unwrap();
      setSuccessMessage("Product status updated!");
      refetchProducts();
    } catch (error) {
      setHasError("Failed to update product status.");
    }
    setShowStatusConfirm(false);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setHasError("");
    setSuccessMessage("");
    try {
      await deleteProduct({ productID: productToDelete.id }).unwrap();
      setSuccessMessage("Product deleted successfully.");
      refetchProducts();
    } catch (error: any) {
      const isConflict =
        error?.status === 409 ||
        error?.originalStatus === 409 ||
        error?.data?.response?.code === 409;

      if (isConflict) {
        try {
          const stores = allStoresData?.response?.body?.content || [];
          for (const store of stores) {
            const storeProducts = (store as any).storeProducts || (store as any).storeProduct || [];
            const hasProd = storeProducts.some((sp: any) => {
              const pId = typeof sp.productID === "object" ? sp.productID?._id : sp.productID;
              return String(pId) === String(productToDelete.id);
            });

            if (hasProd) {
              const updatedStoreProducts = storeProducts
                .filter((sp: any) => {
                  const pId = typeof sp.productID === "object" ? sp.productID?._id : sp.productID;
                  return String(pId) !== String(productToDelete.id);
                })
                .map((sp: any) => ({
                  productID: typeof sp.productID === "object" ? sp.productID?._id : sp.productID,
                  productQuantity: Number(sp.productQuantity) || 0,
                }));

              await editStore({
                storeID: store._id,
                storeProducts: updatedStoreProducts,
              }).unwrap();
            }
          }

          // Retry deleting product after cleaning up store allocations
          await deleteProduct({ productID: productToDelete.id }).unwrap();
          setSuccessMessage("Product deleted successfully.");
          refetchProducts();
          return;
        } catch (cleanupErr) {
          console.error("Frontend store cleanup before delete failed:", cleanupErr);
        }
      }

      const msg =
        error?.data?.response?.message ||
        error?.data?.message ||
        error?.message ||
        "Cannot delete product because it is allocated to store branch(es) or linked to active transactions.";
      setHasError(msg);
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  // --- Pagination ---
  const totalPages = productsData?.response?.body?.pagination?.totalPages || 1;

  // --- Error UI ---
  if (isError) {
    return (
      <div className="text-center text-red-500">
        Failed to load products. Please try again later.
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="flex flex-col w-full p-4 gap-4">
      {/* Header */}
      <div className="h-4 bg-white outline-5 outline-white z-40 -m-4 sticky top-0"></div>
      <div className="sticky top-6 z-40 bg-white flex flex-col w-full gap-4">
        {/* Alerts */}
        {hasError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {hasError}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded">
            {successMessage}
          </div>
        )}

        <div
          className={`sticky top-6 z-40 outline-white outline-5 bg-white flex flex-col w-full gap-3 transition-shadow duration-200 ${
              hasShadow ? "shadow-lg" : ""
          }`}
        >

          {/* Breadcrumb */}
          <div className="flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1">
                <li>
                  <a href="/dashboard" className="text-gray-500 hover:text-gray-700 text-[14px]">
                    Dashboard
                  </a>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                  <a href="/products" className="text-[#DF5C5D] text-[14px] font-medium">
                    Products
                  </a>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* Top Controls */}
          <div className="flex items-center justify-between">
            <div className="text-[24px] font-[700]">Product Inventory</div>
            <div>
              <Link href="/products/add">
                <Button className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              {/* Settings Button with Tooltip */}
              <div className="relative group inline-block justify-center items-center">
                <Button
                  className="bg-white hover:bg-gray-200 text-gray-700 ml-2"
                  onClick={() => setShowDrawer(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <span
                  className="
                    absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                    p-1 rounded bg-black text-white text-[10px] font-normal shadow-lg
                    opacity-0 group-hover:opacity-100
                    pointer-events-none transition-opacity duration-200 z-20
                    flex-wrap justify-center items-center flex
                  "
                >
                  Add Category/Brand
                </span>
              </div>
            </div>
          </div>

          {/* Drawer */}
          <CategoryBrandDrawer open={showDrawer} onOpenChange={setShowDrawer} />

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center p-1 overflow-visible">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 h-10 rounded-lg border border-gray-300"
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="w-full md:w-48 px-0.5">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#DF5C5D]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter Dropdown */}
            <div className="w-full md:w-52 px-0.5">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#DF5C5D]">
                  <SelectValue placeholder="Sort by: Default" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="default">Sort by: Default</SelectItem>
                  <SelectItem value="a-z">Name: A - Z</SelectItem>
                  <SelectItem value="z-a">Name: Z - A</SelectItem>
                  <SelectItem value="price-low-high">Price: Lowest to Highest</SelectItem>
                  <SelectItem value="price-high-low">Price: Highest to Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
      </div>
    </div>

    {/* Table */}
    <Card className="shadow-none border-none">
      <CardContent className="p-0">
        <div className="h-[475px] max-h-[475px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-200 border-x-0">
                <TableHead className="sticky top-0 z-10 bg-gray-100 pl-10 w-[50px] border-x-0">No.</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[270px] border-x-0">Product Info</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[150px] border-x-0">Category</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[100px] border-x-0">Price</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[100px] border-x-0">Stocks</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[50px] border-x-0">Status</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 text-center w-[50px] border-x-0">Action</TableHead>
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            {productsDataIsLoading || productsDataIsFetching ? (
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-gray-50">
                    <TableCell className="pl-10">
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-16 h-16 rounded" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : sortedProducts.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    NO PRODUCTS FOUND
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {sortedProducts.map((product, index) => (
                  <TableRow key={product.id} className="hover:bg-gray-50 border-x-0">
                    <TableCell className="pl-10 border-x-0 max-w-[50px] w-[50px] sm:max-w-[80px] sm:w-[80px] whitespace-nowrap min-w-0">
                      {index + 1}
                    </TableCell>
                    <TableCell 
                    className="border-x-0 max-w-[400px] sm:max-w-[400px] whitespace-nowrap min-w-0
                              hover:bg-gray-100 cursor-pointer group"
                    onClick={() => router.push(`/products/${encodeURIComponent(product.code)}`)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        router.push(`/products/${encodeURIComponent(product.code)}`);
                      }
                    }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                          <img
                            src={product.image || "/imgplaceholder.jpg"}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <div className="font-semibold max-w-[180px] md:max-w-[240px] text-pretty break-words">{product.name}</div>
                          <div className="text-xs text-gray-500 max-w-[120px] md:max-w-[180px] text-pretty break-all">{product.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-x-0 max-w-[150px] sm:max-w-[200px] text-pretty break-words min-w-0">
                      {product.category}
                    </TableCell>
                    <TableCell className="border-x-0 max-w-[80px] text-pretty break-words min-w-0">
                      ₱{Number(product.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="border-x-0 max-w-[80px] text-pretty break-words min-w-0">
                      {Number(product.stocks ?? 0).toLocaleString()} Items
                    </TableCell>
                    <TableCell className="border-x-0 justify-center items-center">
                      <Switch
                        checked={product.status}
                        onCheckedChange={() => handleStatusToggle(product)}
                      />
                    </TableCell>
                    <TableCell className="border-x-0 justify-center items-center">
                      <div className="flex gap-1 justify-center hover:cursor-pointer items-center" 
                      >
                        <Link href={`/products/${product.code}/edit`}>
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#DF5C5D] hover:text-[#DF5C5D]/90 hover:bg-red-50"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>

    {/* Pagination */}
    <div className="border-t flex justify-center">
      <nav className="inline-flex mt-5 items-center space-x-2 text-sm" aria-label="Pagination">
        {/* Previous */}
        <button
          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        {/* Page Numbers */}
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
        {/* Next */}
        <button
          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>

    {/* Status Confirm Dialog */}
    <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {productToToggle?.newStatus ? "Add Product Back" : "Remove Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            {productToToggle?.newStatus
              ? "Are you sure you want to add this product back to inventory?"
              : "Are you sure you want to temporarily remove this product from inventory?"}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowStatusConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={confirmStatusToggle} className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Dialog */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <b>{productToDelete?.name}</b>? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default ProductsPage;
