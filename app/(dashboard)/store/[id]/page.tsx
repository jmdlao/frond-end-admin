"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  Package,
  Receipt,
  Search,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useId, useState } from "react";

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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "../store-context";
import { AddCashier } from "./AddCashier";
import { AddProduct } from "./AddProduct";

// Add type definitions
interface TransactionDetail {
  image: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
  totalPrice: number;
}

interface Transaction {
  id: string;
  dateTime: string;
  customerName: string;
  paymentType: string;
  items: number;
  amount: number;
  details: TransactionDetail[];
}

// Add Product interface
interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  image: string;
}

import {
  useEditStoreMutation,
  useStoreByIDControllerQuery,
  useStoreControllerFindAllQuery,
} from "@/Redux/Services/storeApiService";

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return value;
};

// Move categories definition before the AddProductModal component
// const categories = ["Footwear", "Shoes"]; // Add all your categories here

// AddProductModal component with categories prop
// const AddProductModal = ({ categories }: { categories: string[] }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [step, setStep] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [productToDelete, setProductToDelete] = useState<string | null>(null);
//   const [showAddConfirm, setShowAddConfirm] = useState(false);

//   const handleDeleteClick = (productId: string) => {
//     setProductToDelete(productId);
//     setShowDeleteConfirm(true);
//   };

//   const confirmDelete = () => {
//     if (productToDelete) {
//       setSelectedProducts((prev) =>
//         prev.filter((id) => id !== productToDelete)
//       );
//       setShowDeleteConfirm(false);
//       setProductToDelete(null);
//     }
//   };

//   const handleAddProducts = () => {
//     setShowAddConfirm(true);
//   };

//   const confirmAddProducts = () => {
//     setShowAddConfirm(false);
//     setIsOpen(false);
//     // Add your logic here to save the products
//   };

//   return (
//     <>
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//           <Button className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90">
//             <Plus className="mr-1 h-4 w-4" />
//             Add Products
//           </Button>
//         </DialogTrigger>
//         <DialogContent className="max-w-4xl">
//           <DialogHeader>
//             <DialogTitle>Add Products</DialogTitle>
//           </DialogHeader>

//           {/* Stepper */}
//           <div className="flex items-center gap-4 mb-6">
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   step === 1 ? "bg-[#DF5C5D] text-white" : "bg-gray-200"
//                 }`}
//               >
//                 1
//               </div>
//               <span className={step === 1 ? "text-[#DF5C5D] font-medium" : ""}>
//                 Choose Products
//               </span>
//             </div>
//             <div className="flex-1 h-[2px] bg-gray-200" />
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   step === 2 ? "bg-[#DF5C5D] text-white" : "bg-gray-200"
//                 }`}
//               >
//                 2
//               </div>
//               <span className={step === 2 ? "text-[#DF5C5D] font-medium" : ""}>
//                 Verification
//               </span>
//             </div>
//           </div>

//           {/* Step 1: Choose Products */}
//           {step === 1 && (
//             <div className="space-y-4">
//               {/* Search and Filter */}
//               <div className="flex items-center gap-4">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search products..."
//                     className="pl-10"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline">
//                       {categoryFilter === "all"
//                         ? "All Categories"
//                         : categoryFilter}
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent>
//                     <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
//                       All Categories
//                     </DropdownMenuItem>
//                     {categories?.map((category: string) => (
//                       <DropdownMenuItem
//                         key={category}
//                         onClick={() => setCategoryFilter(category)}
//                       >
//                         {category}
//                       </DropdownMenuItem>
//                     ))}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>

//               {/* Products Table */}
//               <div className="border rounded-lg">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="hover:bg-transparent">
//                       <TableHead className="w-[50px]">
//                         <Checkbox
//                           checked={
//                             selectedProducts.length > 0 &&
//                             products
//                               .filter((product) => {
//                                 const matchesSearch = product.name
//                                   .toLowerCase()
//                                   .includes(searchQuery.toLowerCase());
//                                 return categoryFilter === "all"
//                                   ? matchesSearch
//                                   : matchesSearch &&
//                                       product.category === categoryFilter;
//                               })
//                               .every((product) =>
//                                 selectedProducts.includes(product.id)
//                               )
//                           }
//                           onCheckedChange={(checked: boolean) => {
//                             const filteredProductIds = products
//                               .filter((product) => {
//                                 const matchesSearch = product.name
//                                   .toLowerCase()
//                                   .includes(searchQuery.toLowerCase());
//                                 return categoryFilter === "all"
//                                   ? matchesSearch
//                                   : matchesSearch &&
//                                       product.category === categoryFilter;
//                               })
//                               .map((product) => product.id);

//                             setSelectedProducts(
//                               checked ? filteredProductIds : []
//                             );
//                           }}
//                         />
//                       </TableHead>
//                       <TableHead>Product Code</TableHead>
//                       <TableHead>Image</TableHead>
//                       <TableHead>Product Name</TableHead>
//                       <TableHead>Price</TableHead>
//                       <TableHead>Stocks</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {products
//                       .filter((product) => {
//                         const matchesSearch = product.name
//                           .toLowerCase()
//                           .includes(searchQuery.toLowerCase());
//                         return categoryFilter === "all"
//                           ? matchesSearch
//                           : matchesSearch &&
//                               product.category === categoryFilter;
//                       })
//                       .map((product) => (
//                         <TableRow key={product.id} className="hover:bg-gray-50">
//                           <TableCell className="w-[50px]">
//                             <Checkbox
//                               checked={selectedProducts.includes(product.id)}
//                               onCheckedChange={(checked: boolean) => {
//                                 setSelectedProducts((prev) =>
//                                   checked
//                                     ? [...prev, product.id]
//                                     : prev.filter((id) => id !== product.id)
//                                 );
//                               }}
//                             />
//                           </TableCell>
//                           <TableCell>{product.sku}</TableCell>
//                           <TableCell>
//                             <img
//                               src={product.image}
//                               alt={product.name}
//                               className="w-12 h-12 object-cover rounded"
//                             />
//                           </TableCell>
//                           <TableCell>{product.name}</TableCell>
//                           <TableCell>₱{product.price.toFixed(2)}</TableCell>
//                           <TableCell>{product.stock} items</TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {/* Navigation Buttons */}
//               <div className="flex justify-end gap-2 mt-6">
//                 <Button variant="outline" onClick={() => setIsOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button
//                   className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
//                   onClick={() => setStep(2)}
//                   disabled={selectedProducts.length === 0}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Verification */}
//           {step === 2 && (
//             <div className="space-y-4">
//               <div className="border rounded-lg">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="hover:bg-transparent">
//                       <TableHead>Product Code</TableHead>
//                       <TableHead>Image</TableHead>
//                       <TableHead>Product Name</TableHead>
//                       <TableHead>Price</TableHead>
//                       <TableHead>Quantity</TableHead>
//                       <TableHead>Action</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {products
//                       .filter((product) =>
//                         selectedProducts.includes(product.id)
//                       )
//                       .map((product) => (
//                         <TableRow key={product.id}>
//                           <TableCell>{product.sku}</TableCell>
//                           <TableCell>
//                             <img
//                               src={product.image}
//                               alt={product.name}
//                               className="w-12 h-12 object-cover rounded"
//                             />
//                           </TableCell>
//                           <TableCell>{product.name}</TableCell>
//                           <TableCell>₱{product.price.toFixed(2)}</TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="h-8 w-8"
//                                 onClick={() => {
//                                   setQuantities((prev) => ({
//                                     ...prev,
//                                     [product.id]: Math.max(
//                                       0,
//                                       (prev[product.id] || 0) - 1
//                                     ),
//                                   }));
//                                 }}
//                               >
//                                 -
//                               </Button>
//                               <Input
//                                 type="number"
//                                 value={quantities[product.id] || 0}
//                                 onChange={(e) => {
//                                   const value = parseInt(e.target.value) || 0;
//                                   setQuantities((prev) => ({
//                                     ...prev,
//                                     [product.id]: Math.max(0, value),
//                                   }));
//                                 }}
//                                 className="w-16 text-center"
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 className="h-8 w-8"
//                                 onClick={() => {
//                                   setQuantities((prev) => ({
//                                     ...prev,
//                                     [product.id]: (prev[product.id] || 0) + 1,
//                                   }));
//                                 }}
//                               >
//                                 +
//                               </Button>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
//                               onClick={() => handleDeleteClick(product.id)}
//                             >
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 width="16"
//                                 height="16"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth="2"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               >
//                                 <path d="M3 6h18" />
//                                 <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
//                                 <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
//                               </svg>
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {/* Navigation Buttons */}
//               <div className="flex justify-end gap-2 mt-6">
//                 <Button variant="outline" onClick={() => setStep(1)}>
//                   Back
//                 </Button>
//                 <Button
//                   className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
//                   onClick={handleAddProducts}
//                 >
//                   Add Products
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Remove Product</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p className="text-sm text-gray-500">
//               Are you sure you want to remove this product from the list?
//             </p>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowDeleteConfirm(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmDelete}
//               className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
//             >
//               Remove
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Add Products Confirmation Dialog */}
//       <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Add Products</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p className="text-sm text-gray-500">
//               Are you sure you want to add these products to the store?
//             </p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAddConfirm(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={confirmAddProducts}
//               className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
//             >
//               Confirm
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// Main StoreDetailsPage component
const StoreDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { getStore } = useStore();
  const resolvedParams = React.use(params);
  const store = getStore(resolvedParams.id);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCashierModal, setShowAddCashierModal] = useState(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);

  const {
    data: storeData,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreByIDControllerQuery({ Store_ID: resolvedParams.id });

  const { data: storeCashiersData, refetch: storeCashierRefetch } =
    useStoreControllerFindAllQuery({
      storeCashiers: resolvedParams.id,
    });

  const { data: storeProductsData, refetch: storeProductRefetch } =
    useStoreControllerFindAllQuery({
      storeProducts: resolvedParams.id,
    });

  const {
    data: storeTransactionsData,
    refetch: transactionRefetch,
    isFetching: transactionisfetching,
  } = useStoreControllerFindAllQuery({
    storeTransactions: resolvedParams.id,
    page: currentTransactionPage,
  });

  // console.log(
  //   "Store Transactions",
  //   storeTransactionsData?.response?.body?.content[0] || "No records found"
  // );

  const [editStore] = useEditStoreMutation();

  const navStore = storeData?.response?.body?.content;

  // const transactions: Transaction[] = [
  //   {
  //     id: "TRX001",
  //     dateTime: "2024-03-20 02:30 PM",
  //     customerName: "John Doe",
  //     paymentType: "Credit Card",
  //     items: 3,
  //     amount: 299.99,
  //     details: [
  //       {
  //         image: "/LOGO.png",
  //         productId: "PRD001",
  //         productName: "Nike Air Max",
  //         price: 99.99,
  //         quantity: 2,
  //         discount: 0,
  //         totalPrice: 199.98,
  //       },
  //       {
  //         image: "/LOGO.png",
  //         productId: "PRD002",
  //         productName: "Adidas Ultraboost",
  //         price: 100.01,
  //         quantity: 1,
  //         discount: 0,
  //         totalPrice: 100.01,
  //       },
  //     ],
  //   },
  //   // ...other transactions
  // ];

  const transactions: Transaction[] =
    storeTransactionsData?.response?.body?.content?.map((transaction: any) => ({
      id: transaction.orderID,
      dateTime: transaction.orderDateTime || "",
      customerName: transaction.customerName || "Unnamed Customer",
      paymentType:
        transaction.orderPaymentType === 1
          ? "Cash"
          : transaction.orderPaymentType === 2
          ? "Card"
          : "No Payment Yet",
      items: transaction.orderItems.length,
      amount: transaction.orderFinalAmount || 0,
      details: transaction.orderItems.map((item: any) => ({
        image: item.productID?.productImage || "/LOGO.png",
        productId: item.productID?._id,
        productName: item.productID?.productName,
        price: item.productID?.productPrice || 0,
        quantity: item.productQuantity || 0,
        discount: item.productID?.productDiscount || 0,
        totalPrice:
          (item.productID?.productSellingPrice || 0) *
          (item.productQuantity || 0),
      })),
    })) || [];

  const storeDetails = {
    name: navStore?.storeName || "Store Name",
    location: navStore?.storeLocation || "Store Location",
    operatingHours: navStore?.storeOpenClosing || "Operating Hours",
  };

  const cashiers =
    storeCashiersData?.response?.body?.content[0]?.storeCashier?.map(
      (cashier: any) => ({
        id: cashier.cashierID?._id,
        name: `${cashier.cashierID?.firstName} ${cashier.cashierID?.lastName}`,
        branchLocation: cashier.cashierID?.branchLocation,
        contactNumber: cashier.cashierID?.phoneNumber,
      })
    ) || [];

  const products =
    storeProductsData?.response?.body?.content[0]?.storeProduct
      ?.filter((product: any) => product.productID)
      .map((product: any) => ({
        id: product.productID?._id,
        image: product.productID?.productImage || "/LOGO.png",
        name: product.productID?.productName,
        sku: product.productID?.productCode,
        category: product.productID?.categoriesID.categoryName,
        price: product.productID?.productSellingPrice,
        stock: product.productQuantity,
        status:
          product.productID?.productStatus === 1
            ? "In Stock"
            : product.productID?.productStatus === 0
            ? "Disabled"
            : "Out of Stock",
      })) || [];

  const transactionTotalPages =
    storeTransactionsData?.response?.body?.pagination?.totalPages || 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [storeName, setStoreName] = useState(store?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<number[]>([]);
  const [showLeftEllipsis, setShowLeftEllipsis] = useState(false);
  const [showRightEllipsis, setShowRightEllipsis] = useState(false);
  const itemsPerPage = 10;
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categoryFilterId = useId();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [storeProducts, setStoreProducts] = useState<Product[]>(products ?? []);

  // Reset current page when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Update the filteredTransactions function to only use search
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredCashiers = cashiers.filter((cashier) => {
    // return (
    //   cashier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //   cashier.branchLocation
    //     .toLowerCase()
    //     .includes(searchQuery.toLowerCase()) ||
    //   cashier.contactNumber.includes(searchQuery)
    // );
  });

  const filteredProducts = storeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === "all") return matchesSearch;
    return matchesSearch && product.category === categoryFilter;
  });

  // useEffect(() => {
  //   const getPageNumbers = () => {
  //     const pageNumbers: number[] = [];
  //     const paginationItemsToDisplay = 5;
  //     const halfDisplay = Math.floor(paginationItemsToDisplay / 2);

  //     const currentTotalPages =
  //       Math.ceil(
  //         activeTab === "transactions"
  //           ? filteredTransactions.length
  //           : activeTab === "cashiers"
  //           ? filteredCashiers.length
  //           : filteredProducts.length
  //       ) / itemsPerPage;

  //     let startPage = Math.max(1, currentPage - halfDisplay);
  //     let endPage = Math.min(
  //       currentTotalPages,
  //       startPage + paginationItemsToDisplay - 1
  //     );

  //     if (endPage - startPage + 1 < paginationItemsToDisplay) {
  //       startPage = Math.max(1, endPage - paginationItemsToDisplay + 1);
  //     }

  //     for (let i = startPage; i <= endPage; i++) {
  //       pageNumbers.push(i);
  //     }

  //     setShowLeftEllipsis(pageNumbers[0] > 1);
  //     setShowRightEllipsis(
  //       pageNumbers[pageNumbers.length - 1] < currentTotalPages
  //     );

  //     return pageNumbers;
  //   };

  //   setPages(getPageNumbers());
  // }, [
  //   activeTab,
  //   currentPage,
  //   filteredTransactions.length,
  //   filteredCashiers.length,
  //   filteredProducts.length,
  // ]);

  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500";
      case "Disabled":
        return "bg-yellow-500";
      case "Out of Stock":
        return "bg-red-500";
    }
  };

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreName(e.target.value);
  };

  const handleStoreNameBlur = () => {
    setIsEditing(false);
    if (storeName !== store?.name) {
      editStore({
        storeID: resolvedParams.id,
        storeName: storeName,
      }).unwrap();
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setEditedProduct(product);
    setImagePreview(product.image);
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setEditedProduct((prev: Product | null) =>
          prev
            ? {
                ...prev,
                image: reader.result as string,
              }
            : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (!editedProduct) return;

    // Update the product in the list
    setStoreProducts((prev: Product[]) =>
      prev.map((p: Product) => (p.id === editedProduct.id ? editedProduct : p))
    );
    setShowEditModal(false);
  };

  useEffect(() => {
    transactionRefetch();
  }, [currentTransactionPage, storeTransactionsData]);

  if (storeLoading || !storeData) {
    return (
      <div className="flex justify-center items-center h-96">
        <span>Loading store details...</span>
      </div>
    );
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="flex flex-col w-full p-4 gap-4">
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
              <Link
                href="/store"
                className="text-gray-500 hover:text-gray-700 text-[14px]"
              >
                Store Branch
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-[#DF5C5D] text-[14px] font-medium">
                Store Details
              </span>
            </li>
          </ol>
        </nav>
        <Link href="/store">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Store Information Section */}
      <div className="flex flex-col gap-2">
        {/* Store Name with Edit */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <input
              type="text"
              value={storeName}
              onChange={handleStoreNameChange}
              onBlur={handleStoreNameBlur}
              className="text-[24px] font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded px-1"
              autoFocus
            />
          ) : (
            <div className="text-[24px] font-semibold">{storeName}</div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-1"
            onClick={() => setIsEditing(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-pencil"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </Button>
        </div>

        {/* Store Details */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-map-pin"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{storeDetails.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-clock"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{storeDetails.operatingHours}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center justify-between border-b">
        <Tabs
          defaultValue="transactions"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="flex items-center justify-between">
            <TabsList className="bg-background mb-3 h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:text-[#DF5C5D] data-[state=active]:after:bg-[#DF5C5D] relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <Receipt
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="cashiers"
                className="data-[state=active]:text-[#DF5C5D] data-[state=active]:after:bg-[#DF5C5D] relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <Users
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Cashiers
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:text-[#DF5C5D] data-[state=active]:after:bg-[#DF5C5D] relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
              >
                <Package
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Products
              </TabsTrigger>
            </TabsList>
            {activeTab === "products" ? (
              <div className="flex items-center gap-2 mb-3">
                {/* <AddProductModal categories={categories} /> */}
                <Button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                >
                  Add Product
                </Button>
              </div>
            ) : activeTab === "cashiers" ? (
              <div className="flex items-center gap-2 mb-3">
                <Button
                  className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                  onClick={() => setShowAddCashierModal(true)}
                >
                  Add Cashier
                </Button>
              </div>
            ) : null}
          </div>

          {/* Search Bar and Date Range for Transactions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "transactions" && (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3">
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            <div className="border rounded-md p-2">
                              <div className="text-sm font-medium mb-2">
                                Start Date
                              </div>
                              <Input
                                type="date"
                                value={
                                  dateRange.from
                                    ? format(dateRange.from, "yyyy-MM-dd")
                                    : ""
                                }
                                onChange={(e) => {
                                  const date = e.target.value
                                    ? new Date(e.target.value)
                                    : undefined;
                                  setDateRange((prev) => ({
                                    ...prev,
                                    from: date,
                                  }));
                                }}
                              />
                            </div>
                            <div className="border rounded-md p-2">
                              <div className="text-sm font-medium mb-2">
                                End Date
                              </div>
                              <Input
                                type="date"
                                value={
                                  dateRange.to
                                    ? format(dateRange.to, "yyyy-MM-dd")
                                    : ""
                                }
                                onChange={(e) => {
                                  const date = e.target.value
                                    ? new Date(e.target.value)
                                    : undefined;
                                  setDateRange((prev) => ({
                                    ...prev,
                                    to: date,
                                  }));
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end border-t pt-4">
                            <Button
                              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                              onClick={() => {
                                document.dispatchEvent(
                                  new KeyboardEvent("keydown", {
                                    key: "Escape",
                                  })
                                );
                              }}
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="transactions">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-x-0">
                  <TableHead className="w-[150px] border-x-0">
                    Transaction No.
                  </TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Date and Time
                  </TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Customer Name
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Payment Type
                  </TableHead>
                  <TableHead className="w-[100px] border-x-0">Items</TableHead>
                  <TableHead className="w-[150px] border-x-0">Amount</TableHead>
                  <TableHead className="w-[100px] border-x-0">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionisfetching ? (
                  <TableRow className="w-full">
                    <TableCell colSpan={7} className="h-24 text-center">
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
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction: Transaction) => (
                    <React.Fragment key={transaction.id}>
                      <TableRow className="hover:bg-gray-50 border-x-0">
                        <TableCell className="border-x-0">
                          {transaction.id}
                        </TableCell>
                        <TableCell className="border-x-0">
                          {transaction.dateTime
                            ? format(
                                new Date(transaction.dateTime),
                                "yyyy-MM-dd hh:mm a"
                              )
                            : ""}
                        </TableCell>
                        <TableCell className="border-x-0">
                          {transaction.customerName}
                        </TableCell>
                        <TableCell className="border-x-0">
                          {transaction.paymentType}
                        </TableCell>
                        <TableCell className="border-x-0">
                          {transaction.items}
                        </TableCell>
                        <TableCell className="border-x-0">
                          ₱{transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="border-x-0">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleRow(transaction.id)}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                expandedRows.has(transaction.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(transaction.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0 border-x-0">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px]">
                                      Image
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                      Product ID
                                    </TableHead>
                                    <TableHead className="w-[200px]">
                                      Product Name
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                      Price
                                    </TableHead>
                                    <TableHead className="w-[100px]">
                                      Quantity
                                    </TableHead>
                                    {/* <TableHead className="w-[100px]">
                                        Discount
                                      </TableHead> */}
                                    <TableHead className="w-[100px]">
                                      Amount
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {transaction.details.map(
                                    (
                                      detail: TransactionDetail,
                                      index: number
                                    ) => (
                                      <TableRow
                                        key={index}
                                        className="hover:bg-white"
                                      >
                                        <TableCell>
                                          <img
                                            src={detail.image}
                                            alt={detail.productName}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {detail.productId}
                                        </TableCell>
                                        <TableCell>
                                          {detail.productName}
                                        </TableCell>
                                        <TableCell>
                                          ₱{detail.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{detail.quantity}</TableCell>
                                        {/* <TableCell>
                                            ₱{detail.discount.toFixed(2)}
                                          </TableCell> */}
                                        <TableCell>
                                          ₱
                                          {(
                                            detail.price * detail.quantity
                                          ).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination for Transactions */}
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Showing{" "}
                {filteredTransactions.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredTransactions.length
                )}{" "}
                of {filteredTransactions.length}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() =>
                        setCurrentTransactionPage((prev) => prev - 1)
                      }
                      aria-disabled={currentTransactionPage === 1}
                    />
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {Array.from({ length: transactionTotalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        className={`px-3 py-1 rounded-md ${
                          currentTransactionPage === pageNumber
                            ? "bg-red-600 text-white font-medium"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setCurrentTransactionPage(pageNumber)}
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
                      onClick={() =>
                        setCurrentTransactionPage((prev) => prev + 1)
                      }
                      aria-disabled={
                        currentTransactionPage === transactionTotalPages
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>

          <TabsContent value="cashiers">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-x-0">
                  <TableHead className="w-[80px] border-x-0">No.</TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Cashier
                  </TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Branch Location
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Contact Number
                  </TableHead>
                  <TableHead className="w-[100px] border-x-0">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No cashiers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginateData(cashiers).map((cashier, index: number) => (
                    <TableRow
                      key={cashier.id}
                      className="hover:bg-gray-50 border-x-0"
                    >
                      <TableCell className="border-x-0">{index + 1}</TableCell>
                      <TableCell className="border-x-0">
                        {cashier.name}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {storeDetails.location}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {formatPhoneNumber(cashier.contactNumber)}
                      </TableCell>
                      <TableCell className="border-x-0">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={
                              () => {} /* Handle delete product logic here */
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-trash-2 text-red-500"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination for Cashiers */}
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Showing{" "}
                {filteredCashiers.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to{" "}
                {Math.min(currentPage * itemsPerPage, filteredCashiers.length)}{" "}
                of {filteredCashiers.length} cashiers
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        className="cursor-pointer"
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      aria-disabled={
                        currentPage * itemsPerPage >= filteredCashiers.length
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-x-0">
                  <TableHead className="w-[80px] border-x-0">No.</TableHead>
                  <TableHead className="w-[100px] border-x-0">Image</TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Product Code
                  </TableHead>
                  <TableHead className="w-[200px] border-x-0">
                    Product Name
                  </TableHead>
                  <TableHead className="w-[150px] border-x-0">
                    Category
                  </TableHead>
                  <TableHead className="w-[100px] border-x-0">Price</TableHead>
                  <TableHead className="w-[100px] border-x-0">Stock</TableHead>
                  <TableHead className="w-[100px] border-x-0">Status</TableHead>
                  <TableHead className="w-[100px] border-x-0">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginateData(products ?? []).map((product, index) => (
                    <TableRow
                      key={product.id}
                      className="hover:bg-gray-50 border-x-0"
                    >
                      <TableCell className="border-x-0">{index + 1}</TableCell>
                      <TableCell className="border-x-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="border-x-0">
                        {product.sku}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {product.name}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {product.category}
                      </TableCell>
                      <TableCell className="border-x-0">
                        ₱{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="border-x-0">
                        {product.stock} items
                      </TableCell>
                      <TableCell className="border-x-0">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              product.status
                            )}`}
                          />
                          <span>{product.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-x-0">
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={
                            () => {} /* Handle delete product logic here */
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash-2 text-red-500"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination for Products */}
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">
                Showing{" "}
                {filteredProducts.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to{" "}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
                of {filteredProducts.length} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        className="cursor-pointer"
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      aria-disabled={
                        currentPage * itemsPerPage >= filteredProducts.length
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Image */}
            <div className="col-span-4">
              <div className="space-y-3">
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-gray-50/50">
                  <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-white shadow-sm">
                    <Image
                      src={imagePreview}
                      alt={editedProduct?.name || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="product-image"
                    />
                    <Label
                      htmlFor="product-image"
                      className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 w-full bg-white shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Change Image
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="col-span-2 space-y-6">
                  <div className="p-6 border rounded-lg bg-gray-50/50 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Product Name
                      </Label>
                      <Input
                        value={editedProduct?.name || ""}
                        onChange={(e) =>
                          setEditedProduct((prev: Product | null) =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                        className="bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Product Code
                      </Label>
                      <Input
                        value={editedProduct?.id || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category</Label>
                      <Input
                        value={editedProduct?.category || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock and Price */}
                <div className="col-span-2 space-y-6">
                  <div className="p-6 border rounded-lg bg-gray-50/50 space-y-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          editedProduct?.status ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {editedProduct?.status ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Stock Quantity
                        </Label>
                        <Input
                          type="number"
                          value={editedProduct?.stock || 0}
                          onChange={(e) =>
                            setEditedProduct((prev: Product | null) =>
                              prev
                                ? { ...prev, stock: parseInt(e.target.value) }
                                : null
                            )
                          }
                          min="0"
                          className="bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Price</Label>
                        <Input
                          type="number"
                          value={editedProduct?.price || 0}
                          onChange={(e) =>
                            setEditedProduct((prev: Product | null) =>
                              prev
                                ? { ...prev, price: parseFloat(e.target.value) }
                                : null
                            )
                          }
                          min="0"
                          step="0.01"
                          className="bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddProduct
        modalStatus={showAddProductModal}
        changeModalStatus={setShowAddProductModal}
        onProductsUpdated={() => {
          storeProductRefetch();
        }}
        initialQuantities={products.reduce((acc, product) => {
          acc[product.id] = product.stock;
          return acc;
        }, {} as Record<string, number>)}
      />

      <AddCashier
        modalStatus={showAddCashierModal}
        changeModalStatus={setShowAddCashierModal}
        onCashiersUpdated={() => {
          storeCashierRefetch();
        }}
        currentCashiers={cashiers}
      />
    </div>
  );
};

export default StoreDetailsPage;
