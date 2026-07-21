"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useProductsControllerFindByCodeQuery } from "@/Redux/Services/productsAPpiService";

export default function ProductDetailsPage() {
  const { code } = useParams() as { code: string };
  const router = useRouter();

  function getProductFromData(data: any): any {
    if (!data) return null;
    if (data.productName) return data;
    return data.response?.body?.content || null;
  }

  const { data, isLoading, isError } = useProductsControllerFindByCodeQuery({ productCode: code });
  const product = getProductFromData(data);

  // Shadow for sticky header
//   const [hasShadow, setHasShadow] = useState(false);
//   useEffect(() => {
//     const handleScroll = () => {
//       setHasShadow(window.scrollY > 2);
//     };
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading product details...</div>;
  }

  if (isError || !product) {
    return (
      <div className="p-8 text-center text-red-600">
        Failed to load product details.
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full">
      {/* LEFT: 2/3 - Headers and reserved space */}
      <div className="w-0 flex-grow-[2] min-w-0 max-w-[66%] px-4 ">
        <div className="sticky top-0 z-10 bg-white pb-2">
            <div className="h-10.5 bg-white outline-5 outline-white z-40 -m-4 sticky top-0"></div>
            <div className="sticky top-6 z-40 bg-white flex flex-col w-full gap-4">
          {/* <div
            className={`flex flex-col w-full gap-3 transition-shadow duration-200 ${
              hasShadow ? "shadow-lg" : ""
            }`}
          > */}
            {/* Breadcrumb */}
            <div className="flex items-center justify-between">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1">
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
                      href="/products"
                      className="text-gray-500 hover:text-gray-700 text-[14px]"
                    >
                      Products
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-[#DF5C5D] text-[14px] font-medium">
                      Product Details
                    </span>
                  </li>
                </ol>
              </nav>
              <Link href="/products">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
            <div className="text-[24px] font-[700] -mt-2.5">Product Details</div>
          </div>
          </div>

        {/* </div> */}
      </div>

      {/* RIGHT: 1/3 - Product Details Card */}
      <div className="w-1/3 min-w-[370px] max-w-[500px] px-4">
        <Card className="max-h-screen overflow-auto">
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex flex-col items-center mb-1 -mt-2">
              <div className="w-[200px] h-[170px] relative mb-1 rounded-lg overflow-hidden border bg-white">
                <Image
                  src={product.productImage || "/imgplaceholder.png"}
                  alt={product.productName || "Product image"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            {/* Info Fields */}
            <div className="mb-3">
              <Label className="block text-xs font-medium mb-1">Name Product</Label>
              <Input
                value={product.productName || ""}
                readOnly
                className="bg-gray-100 text-xs font-medium"
              />
            </div>
            <div className="mb-3">
              <Label className="block text-xs font-medium mb-1">Description Product</Label>
              <textarea
                value={product.productDescription || ""}
                readOnly
                className="w-full bg-gray-100 text-xs rounded px-3 py-2  resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <Label className="block font-medium text-xs mb-1">Product Code</Label>
                <Input
                  value={product.productCode || ""}
                  readOnly
                  className="bg-gray-100 text-xs"
                />              
              </div>
              <div className="flex-1">
                <Label className="block text-xs font-medium mb-1">Status</Label>
                <Input
                  value={product.productStatus === 1 ? "Active" : "Inactive"}
                  readOnly
                  className={`text-xs ${product.productStatus === 1 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <Label className="block font-medium text-xs mb-1">Price</Label>
                <Input
                  value={`₱${Number(product.productPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  readOnly
                  className="bg-gray-100 text-xs"
                />
              </div>
              <div className="flex-1">
                <Label className="block font-medium text-xs mb-1">Stocks</Label>
                <Input
                  value={product.productQuantity ?? 0}
                  readOnly
                  className="bg-gray-100 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <Label className="block font-medium mb-1 text-xs">Category</Label>
                <Input
                  value={product.categoriesID?.categoryName || ""}
                  readOnly
                  className="bg-gray-100 text-xs"
                />
              </div>
              <div className="flex-1">
                <Label className="block font-medium text-xs mb-1">Brand</Label>
                <Input
                  value={product.productBrandID?.brandName || ""}
                  readOnly
                  className="bg-gray-100 text-xs"
                />
              </div>
            </div>
            <Button
              className="w-full bg-[#DF5C5D] mt-3"
              onClick={() =>
                router.push(`/products/${encodeURIComponent(product.productCode)}/edit`)
              }
            >
              Edit Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
