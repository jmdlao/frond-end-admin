"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Check, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface product {
  id: number;
  name: string;
  code: string;
  price: number;
  stocks: number;
  image: string;
  category: string | undefined;
  status: boolean;
}

const categories = ["All", "Shoes", "Clothing", "Accessories"];

import { useProductsControllerFindAllQuery } from "@/Redux/Services/productsAPpiService";
import { useStoreForm } from "../Context";

const Step2Page = () => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allStoredProducts, setAllStoredProducts] = useState<product[]>([]);

  const {
    data: products,
    refetch: productRefetch,
    isFetching: isProductFetching,
  } = useProductsControllerFindAllQuery({
    limit: itemsPerPage,
    pageNumber: currentPage,
    search: undefined,
  });

  const allProducts: product[] = (products?.response?.body?.content || []).map(
    (product: any): product => ({
      id: product?._id || 0,
      name: product?.productName || "",
      code: product?.productCode || "",
      price: product?.productPrice ?? 0,
      stocks: product?.productQuantity ?? 0,
      image: product?.productImage || "",
      category: product?.categoriesID?.categoryName || "Uncategorized",
      status: product?.productStatus ?? false,
    })
  );

  useEffect(() => {
    if (products?.response?.body?.content) {
      setAllStoredProducts((prev) => {
        const merged = [
          ...prev,
          ...products.response.body.content.map(
            (product: any): product => ({
              id: product?._id || 0,
              name: product?.productName || "",
              code: product?.productCode || "",
              price: product?.productPrice ?? 0,
              stocks: product?.productQuantity ?? 0,
              image: product?.productImage || "",
              category: product?.categoriesID?.categoryName || "Uncategorized",
              status: product?.productStatus ?? false,
            })
          ),
        ];
        // Remove duplicates by id
        const unique = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );
        return unique;
      });
    }
  }, [products]);

  // console.log("All Stored Products", allStoredProducts);
  // console.log("Selected Products", selectedProducts);

  const { formData, setFormData } = useStoreForm();
  const totalPages = products?.response?.body?.pagination?.totalPages || 1; // fpr pagination
  // console.log(currentPage);
  useEffect(() => {
    productRefetch();
  }, [currentPage, productRefetch]);

  useEffect(() => {
    if (formData.products && formData.products.length > 0) {
      setSelectedProducts(formData.products.map((product: any) => product.id));
    }
  }, [setFormData]);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === allStoredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(allStoredProducts.map((product) => product.id));
    }
  };

  const handleNext = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...new Map(
          allStoredProducts
            .filter((product) => selectedProducts.includes(product.id))
            .map((product) => [
              product.id,
              { ...product, category: product.category ?? "Uncategorized" },
            ])
        ).values(),
      ],
    }));
    router.push("/store/add/step3");
  };

  const handlePrevious = () => {
    router.push("/store/add");
  };

  return (
    <div className="flex flex-col w-full p-4 gap-1">
      {/* Breadcrumb and Back Button */}
      <div className="flex items-center justify-between">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link
                href="/store"
                className="text-gray-500 hover:text-gray-700 text-[14px]"
              >
                Store Branch
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <Link
                href="/store/add"
                className="text-gray-500 hover:text-gray-700 text-[14px]"
              >
                Add Store
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-[#DF5C5D] text-[14px] font-medium">
                Choose Products
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

      <div className="text-[24px] font-[700] mb-4">Choose a Products</div>

      {/* Stepper */}
      <div className="mb-8 flex justify-center">
        <Stepper
          value={2}
          onValueChange={(step) =>
            router.push(step === 1 ? "/store/add" : `/store/add/step${step}`)
          }
        >
          <StepperItem step={1}>
            <StepperTrigger>
              <StepperIndicator isCompleted>
                <Check className="h-5 w-5" />
              </StepperIndicator>
              <div className="space-y-.5">
                <StepperTitle>Store Information</StepperTitle>
                <StepperDescription>Enter store details</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem step={2}>
            <StepperTrigger>
              <StepperIndicator isCurrent>2</StepperIndicator>
              <div className="space-y-.5">
                <StepperTitle>Choose Products</StepperTitle>
                <StepperDescription>Select products to add</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem step={3}>
            <StepperTrigger disabled={selectedProducts.length === 0}>
              <StepperIndicator>3</StepperIndicator>
              <div className="space-y-.5">
                <StepperTitle>Verification</StepperTitle>
                <StepperDescription>Review and confirm</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
      </div>

      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Filter className="h-4 w-4" />
                {selectedCategory === "All"
                  ? "All Categories"
                  : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Products Table */}
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[5px]">
                    <Checkbox
                      checked={
                        selectedProducts.length === allStoredProducts.length
                      }
                      onCheckedChange={toggleAllProducts}
                      className="w-5 h-5 ml-5 data-[state=checked]:bg-[#DF5C5D] data-[state=checked]:border-[#DF5C5D]"
                    />
                  </TableHead>
                  <TableHead className="w-[150px]">Product Code</TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead className="w-[200px]">Product Name</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Stocks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isProductFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : allProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allProducts.map((product, index) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                          className="w-5 h-5 ml-5 data-[state=checked]:bg-[#DF5C5D] data-[state=checked]:border-[#DF5C5D]"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.code}
                      </TableCell>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-25 h-20 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stocks} Items</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={handlePrevious} className="w-40">
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 w-40 text-white"
            disabled={selectedProducts.length === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step2Page;
