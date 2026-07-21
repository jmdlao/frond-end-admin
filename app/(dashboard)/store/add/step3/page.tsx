"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";

const formatPeso = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

import { useCreateStoreMutation } from "@/Redux/Services/storeApiService";
import { useStoreForm } from "../Context";

const Step3Page = () => {
  const router = useRouter();
  const { formData, setFormData } = useStoreForm();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  // console.log(
  //   formData.products?.map((product: any) => ({
  //     stocks: product.stocks,
  //   }))
  // );

  const allProducts = (formData.products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    price: product.price,
    quantity: 1,
    stocks: product.stocks,
    image: product.image,
  }));

  const [products, setProducts] = useState(allProducts.slice(0, 5)); // Start with first 5 items
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Load more products when page changes
  useEffect(() => {
    const loadMoreProducts = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Load next 5 items
      const startIndex = page * 5;
      const endIndex = startIndex + 5;
      const newProducts = allProducts.slice(startIndex, endIndex);

      setProducts((prev) => {
        // Filter out products that already exist in prev
        const prevIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newProducts.filter((p) => !prevIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      setLoading(false);

      if (endIndex >= allProducts.length) {
        setHasMore(false);
      }
    };

    if (hasMore) {
      loadMoreProducts();
    }
  }, [page]);

  const handleQuantityChange = (id: number, value: number) => {
    setProducts((products) =>
      products.map((product) =>
        product.id === id ? { ...product, quantity: value } : product
      )
    );
  };

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts((products) =>
        products.filter((product) => product.id !== productToDelete)
      );
      setFormData((prev: any) => ({
        ...prev,
        products: (prev.products ?? []).filter(
          (product: any) => product.id !== productToDelete
        ),
      }));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const [createStore] = useCreateStoreMutation();
  const confirmAndProceed = async () => {
    try {
      console.log("Creating store with data:", formData.location);
      const payload = {
        storeName: formData.name,
        storeLocation: formData.location,
        storeOpenClosing: `${formData.openingTime} - ${formData.closingTime}`,
        storeCashier:
          formData.cashiers && formData.cashiers.length > 0
            ? formData.cashiers.map((cashier: any) => ({
                cashierID: cashier.id,
              }))
            : [],
        storeProducts:
          products && products.length > 0
            ? products.map((product) => ({
                productID: product.id.toString(),
                productQuantity: product.quantity,
              }))
            : [],
      };

      createStore(payload)
        .unwrap()
        .then(() => {
          window.location.href = "/store";
        })
        .catch((error) => {
          setErrorMessage(
            error?.data?.response?.message ||
              error?.data?.errors?.message ||
              "Failed to create store. Please try again."
          );
          console.log(createStore);
        });
    } catch (error) {
      // setErrorMessage("Failed to create store. Please try again.");
      // console.error("Error creating store:", error);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handlePrevious = () => {
    router.push("/store/add/step2");
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
                Verification
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

      <div className="text-[24px] font-[700] mb-4">
        Verification of Products
      </div>

      {/* Stepper */}
      <div className="mb-8 flex justify-center">
        <Stepper
          value={3}
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
              <StepperIndicator isCompleted>
                <Check className="h-5 w-5" />
              </StepperIndicator>
              <div className="space-y-.5">
                <StepperTitle>Choose Products</StepperTitle>
                <StepperDescription>Select products to add</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem step={3}>
            <StepperTrigger>
              <StepperIndicator isCurrent>3</StepperIndicator>
              <div className="space-y-.5">
                <StepperTitle>Verification</StepperTitle>
                <StepperDescription>Review and confirm</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
      </div>

      <div className="space-y-6">
        {/* Products Table */}
        <Card className="border-none shadow-none">
          <CardContent className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-left pl-10">Product</TableHead>
                  <TableHead className="text-center pl-15">Price</TableHead>
                  <TableHead className="text-center pl-15">Quantity</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow
                    key={`product-${product.id}`}
                    className="hover:bg-gray-50"
                    ref={
                      index === products.length - 1
                        ? lastProductElementRef
                        : null
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3 py-2">
                        {/* Image */}
                        <div className="ml-5 w-40 h-30 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        {/* Name and Code */}
                        <div>
                          <div className="font-light text-xs ml-5">
                            {product.id}
                          </div>
                          <div className="font-semibold ml-5">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 ml-5">
                            {product.code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle pl-15">
                      {formatPeso(product.price)}
                    </TableCell>
                    <TableCell className="text-center align-middle pl-15">
                      <div className="text-gray-500 pb-3">
                        <span>Item in Stock: {product.stocks}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              Math.max(1, product.quantity - 1)
                            )
                          }
                          disabled={product.quantity <= 1}
                        >
                          -
                        </Button>
                        <input
                          type="number"
                          placeholder="qty"
                          min={1}
                          value={product.quantity}
                          onChange={(e) => {
                            const value = Math.max(1, parseInt(e.target.value));
                            handleQuantityChange(product.id, value);
                          }}
                          className="w-14 text-center border rounded h-9"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              product.quantity + 1
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle w-50">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 p-10 w-15"
                        onClick={() => handleDelete(product.id)}
                      >
                        <FaTrash size={24} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DF5C5D]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!hasMore && products.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="p-4 text-center text-gray-500"
                    >
                      No more products
                    </TableCell>
                  </TableRow>
                )}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="p-4 text-center text-gray-500"
                    >
                      No products added.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {errorMessage && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={handlePrevious} className="w-40">
            Previous
          </Button>
          <Button
            className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90 w-40 text-white"
            onClick={handleConfirm}
            disabled={products.length === 0}
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the product from your store. Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Products Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you done selecting/picking your products on the store?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAndProceed}
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            >
              Yes, Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Step3Page;
