"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  useEditProductsMutation,
  useProductsControllerFindByCodeQuery,
} from "@/Redux/Services/productsAPpiService";

export default function EditProductPage() {
  const router = useRouter();
  const { code } = useParams() as { code: string };

  // Fetch product by productCode
  const { 
    data: productData, 
    isLoading, 
    isError 
  } = useProductsControllerFindByCodeQuery({ productCode: code });

  const [editProduct] = useEditProductsMutation();

  const [product, setProduct] = useState<{
    name: string;
    description: string;
    code: string;
    price: number;
    sellingPrice: number;
    stocks: number;
    image: string;
    category: string;
    brand: string;
    status: boolean;
    vat: number;
  } | null>(null);

  const [imagePreview, setImagePreview] = useState("/imgplaceholder.png");
  const [hasError, setHasError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);


  const getFetchedProduct = (productData: any) => {
    if (!productData) return null;
    if (productData.productName) return productData; 
    return productData.response?.body?.content || null;
  };

  useEffect(() => {
    const fetched = getFetchedProduct(productData);
    if (fetched) {
      setProduct({
        name: fetched.productName || "",
        description: fetched.productDescription || "",
        code: fetched.productCode || "",
        price: fetched.productPrice ?? 0,
        sellingPrice: fetched.productSellingPrice ?? 0,
        stocks: fetched.productQuantity ?? 0,
        image: fetched.productImage || "/imgplaceholder.png",
        category: fetched.categoriesID?.categoryName || "",
        brand: fetched.productBrandID?.brandName || "",
        status: fetched.productStatus === 1,
        vat: fetched.productHasVat ? 1 : 0,
      });
      setImagePreview(fetched.productImage || "/imgplaceholder.png");
    }
  }, [productData]);

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 500, maxHeight = 500;
          let width = img.width, height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          let base64 = canvas.toDataURL("image/jpeg", 0.8);
          while (base64.length > 100 * 1024) {
            base64 = canvas.toDataURL("image/jpeg", 0.7);
          }
          setImagePreview(base64);
          setProduct((prev) => prev && { ...prev, image: base64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasError("");
    try {
      const fetched = getFetchedProduct(productData);
      if (!fetched || !fetched._id || !product) throw new Error("No product found to edit.");
      await editProduct({
        productID: fetched._id,
        productStatus: product.status ? 1 : 0,
        productName: product.name,
        productDescription: product.description,
        productPrice: product.price,
        productSellingPrice: product.sellingPrice,
        productQuantity: product.stocks,
        productImage: product.image,
        productHasVat: product.vat === 1,
      }).unwrap();
      router.push("/products");
    } catch (error: any) {
      setHasError(
        error?.data?.message ||
        error?.data?.errors ||
        error?.message ||
        "Failed to edit product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 2);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading || !product) {
    return <div className="p-8 text-center">Loading product...</div>;
  }
  if (isError || !productData) {
    return <div className="p-8 text-center text-red-600">Failed to load product.</div>;
  }

  return (
    <div className="flex flex-col w-full px-4 gap-4">
      <div className="h-6.5 bg-white z-10 -m-4 sticky top-0"></div>
      <div className={`sticky top-6.5 z-10 outline-white outline-5 bg-white flex flex-col w-full gap-3 transition-shadow duration-200 ${hasShadow ? "shadow-lg" : ""}`}>
        {/* Breadcrumb and Back */}
        <div className="flex items-center justify-between">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-[14px]">
                  Dashboard
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <Link href="/products" className="text-gray-500 hover:text-gray-700 text-[14px]">
                  Products
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-[#DF5C5D] text-[14px] font-medium">Edit Product</span>
              </li>
            </ol>
          </nav>
          <Link href="/products">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <div className="text-[24px] font-[700] -mt-1.5">Edit Product</div>
        {hasError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {hasError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-6 items-center justify-center">
              {/* Left Column - Image */}
              <div className="col-span-4">
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg border-gray-200">
                  <div className="relative w-full aspect-square border rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={imagePreview || "/imgplaceholder.png"}
                      alt={product.name || "Product image"}
                      fill
                      className="object-cover bg-[#DF5C5D] "
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
                      <Upload className="w-4 h-4" /> Upload Image
                    </Label>
                  </div>
                  <div className="w-full">
                    <Label className="text-sm font-medium">
                      Product Code <span className="text-[#DF5C5D]">*</span>
                    </Label>
                    <Input
                      value={product.code}
                      maxLength={13}
                      className="bg-white shadow-sm"
                      placeholder="Enter product code"
                      disabled
                    />
                  </div>
                </div>
              </div>
              {/* Right Column - Product Details */}
              <div className="col-span-8">
                <div className="grid grid-cols-2">
                  <div className="col-span-2">
                    <div className="px-6 py-4 border rounded-lg border-gray-200 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Product Name <span className="text-[#DF5C5D]">*</span>
                        </Label>
                        <Input
                          value={product.name}
                          onChange={e => setProduct(p => p && ({ ...p, name: e.target.value }))}
                          maxLength={70}
                          className="bg-white shadow-sm"
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="items-center justify-center">
                          <Label className="text-sm font-medium">
                            Product Description <span className="text-[#DF5C5D]">*</span>
                          </Label>
                          <span className="text-[10px] ml-3 text-gray-500 text-right">
                            {product.description?.length || 0}/500
                          </span>
                        </div>
                        <textarea
                          value={product.description || ""}
                          onChange={e => setProduct(p => p && ({ ...p, description: e.target.value }))}
                          maxLength={500}
                          rows={4}
                          className="bg-white shadow-sm border rounded-md px-3 -mt-2 py-2 w-full max-h-[274px] min-h-[274px] focus:outline-none flex-wrap focus:ring-2 resize-none focus:ring-[#DF5C5D] text-sm"
                          placeholder="Enter product description"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Brand <span className="text-[#DF5C5D]">*</span>
                          </Label>
                          <Input value={product.brand || ""} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Category <span className="text-[#DF5C5D]">*</span>
                          </Label>
                          <Input value={product.category || ""} disabled className="bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Pricing and Stocking */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-[16px] ml-3 font-semibold">
              Pricing and Stocking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="col-span-8">
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${product.status ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm font-medium">
                    {product.status ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {/* Prices & VAT */}
                <div className="flex flex-column gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">
                      Selling Price <span className="text-[#DF5C5D]">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={product.sellingPrice === 0 ? "" : product.sellingPrice}
                      onChange={e => {
                        let value = e.target.value.replace(/[^0-9.]/g, "").replace(/^0+(?=\d)/, "");
                        if (value.length > 8) value = value.slice(0, 8);
                        setProduct(prev => prev && ({
                          ...prev,
                          sellingPrice: value === "" ? 0 : parseFloat(value),
                        }));
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="bg-white shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">
                      Price <span className="text-[#DF5C5D]">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={product.price === 0 ? "" : product.price}
                      onChange={e => {
                        let value = e.target.value.replace(/[^0-9.]/g, "").replace(/^0+(?=\d)/, "");
                        if (value.length > 8) value = value.slice(0, 8);
                        setProduct(prev => prev && ({
                          ...prev,
                          price: value === "" ? 0 : parseFloat(value),
                        }));
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="bg-white shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-4 min-w-[180px] justify-center pt-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vat"
                        value={0}
                        checked={product.vat === 0}
                        onChange={() => setProduct(p => p && ({ ...p, vat: 0 }))}
                        className="accent-[#DF5C5D]"
                      />
                      NO VAT
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vat"
                        value={1}
                        checked={product.vat === 1}
                        onChange={() => setProduct(p => p && ({ ...p, vat: 1 }))}
                        className="accent-[#DF5C5D]"
                      />
                      VAT
                    </label>
                  </div>
                </div>
                <div className="">
                  <Label className="text-sm font-medium">
                    Stock Quantity <span className="text-[#DF5C5D]">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={product.stocks === 0 ? "" : product.stocks}
                    onChange={e => {
                      let value = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                      if (value.length > 8) value = value.slice(0, 8);
                      setProduct(prev => prev && ({
                        ...prev,
                        stocks: value === "" ? 0 : parseInt(value, 10),
                      }));
                    }}
                    placeholder="0"
                    min="0"
                    className="bg-white shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end my-6">
          <Button
            type="submit"
            className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
