"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

// redux
import { useBrandControllerFindAllQuery } from "@/Redux/Services/brandApiService";
import { useCategoryControllerFindAllQuery } from "@/Redux/Services/categoryApiService";
import { useAddProductControllerMutation } from "@/Redux/Services/productsAPpiService";

export default function AddProductPage() {
    const router = useRouter();
    const initialProduct = {
        name: "",
        description: "",
        code: "",
        price: 0,
        sellingPrice: 0,
        stocks: 0,
        image: "/imgplaceholder.png",
        category: undefined as string | undefined,
        brand: undefined as string | undefined,
        status: true,
        vat: 0,
    };
    const [newProduct, setNewProduct] = useState<Omit<typeof initialProduct, never>>(initialProduct);
    const [imagePreview, setImagePreview] = useState<string>("/imgplaceholder.png");
    const [hasError, setHasError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasShadow, setHasShadow] = useState(false);

    const { data: categoriesData } = useCategoryControllerFindAllQuery();
    const { data: brandsData } = useBrandControllerFindAllQuery();
    const [addProduct] = useAddProductControllerMutation();

    const categories =
        categoriesData?.response?.body?.content?.map((cat: any) => ({
            _id: cat._id,
            categoryName: cat.categoryName,
        })) || [];
    const brands =
        brandsData?.response?.body?.content?.map((brand: any) => ({
            _id: brand._id,
            brandName: brand.brandName,
        })) || [];

    // --- Image Upload/Resize Handler ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    // Resize image if needed
                    const maxWidth = 500, maxHeight = 500;
                    let width = img.width, height = img.height;
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = (height * maxWidth) / width; width = maxWidth;
                        } else {
                            width = (width * maxHeight) / height; height = maxHeight;
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
                    setNewProduct((prev) => ({ ...prev, image: base64 }));
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Form Submission Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasError("");
        try {
            await addProduct({
                addProductDto: {
                productName: newProduct.name,
                productPrice: newProduct.price,
                productQuantity: newProduct.stocks,
                productImage: newProduct.image,
                categoriesID: newProduct.category || "Uncategorized",
                productStatus: 1,
                productBrandID: newProduct.brand || "Unbranded",
                productDescription: newProduct.description,
                productSellingPrice: newProduct.sellingPrice,
                productThumbnail: [],
                productHasVat: newProduct.vat === 0 ? false : true,
                productCode: newProduct.code || "",
                },
            }).unwrap();
            router.push("/products");
        } catch (error: any) {
            setHasError(
                error?.data?.message ||
                error?.data?.errors ||
                error?.message ||
                "Failed to add product. Please try again."
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

    return (
        <div className="flex flex-col w-full px-4 gap-4">
            <div className="h-6.5 bg-white z-10 -m-4 sticky top-0"></div>
            <div
                className={`sticky top-6.5 z-10 outline-white outline-5 bg-white flex flex-col w-full gap-3 transition-shadow duration-200 ${
                    hasShadow ? "shadow-lg" : ""
                }`}
                >

                {/* Breadcrumb and Back */}
                <div className="flex items-center justify-between">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-1">
                            <li>
                                <a href="/dashboard"
                                    className="text-gray-500 hover:text-gray-700 text-[14px]">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <span className="text-gray-400 mx-2">/</span>
                                <Link href="/products" className="text-gray-500 hover:text-gray-700 text-[14px]">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400 mx-2">/</span>
                                <span className="text-[#DF5C5D] text-[14px] font-medium">Add New Product</span>
                            </li>
                        </ol>
                    </nav>
                    <Link href="/products">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>

                <div className="text-[24px] font-[700] -mt-1.5">Add New Product</div>
                {hasError && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
                    {hasError}
                    </div>
                )}
            </div>
        
            <form onSubmit={handleSubmit}>
                {/* Product Info ----------------------------------------------------------------------------------------------------------*/}
                <Card>
                    <CardHeader className="">
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
                                        alt={newProduct.name || "Product image"}
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
                                        <div className="flex items-center justify-center">
                                            <Label className="text-sm font-medium">
                                                Product Code <span className="text-[#DF5C5D]">*</span>
                                            </Label>
                                            <span className="text-[9px] ml-3    text-gray-500 text-right">
                                                {newProduct.code?.length || 0}/10 (uppercase letters & numbers only)
                                            </span>
                                        </div>
                                        <Input
                                            value={newProduct.code}
                                            onChange={e => {
                                                let value = e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, ""); 
                                                if (value.length > 10) value = value.slice(0, 10);
                                                setNewProduct(p => ({ ...p, code: value }));
                                            }}
                                            maxLength={10}
                                            className="bg-white shadow-sm"
                                            placeholder="Enter product code"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Product Details */}
                            <div className="col-span-8">
                            <div className="grid grid-cols-2">
                            {/* Basic Info */}
                            <div className="col-span-2">
                                <div className="px-6 py-4 border rounded-lg border-gray-200 space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Product Name <span className="text-[#DF5C5D]">*</span></Label>
                                        <Input
                                            value={newProduct.name}
                                            onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                            maxLength={70}
                                            className="bg-white shadow-sm"
                                            placeholder="Enter product name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="items-center justify-center">
                                            <Label className="text-sm font-medium">Product Description <span className="text-[#DF5C5D]">*</span></Label>
                                            <span className="text-[10px] ml-3 text-gray-500 text-right">
                                                {newProduct.description?.length || 0}/500
                                            </span>
                                        </div>
                                        <textarea
                                            value={newProduct.description || ""}
                                            onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                            maxLength={500}
                                            rows={4}
                                            className="bg-white shadow-sm border rounded-md px-3 -mt-2 py-2 w-full max-h-[274px] min-h-[274px] focus:outline-none flex-wrap focus:ring-2 resize-none focus:ring-[#DF5C5D] text-sm"
                                            placeholder="Enter product description"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Brand <span className="text-[#DF5C5D]">*</span></Label>
                                            <Select
                                                value={newProduct.brand}
                                                onValueChange={value => setNewProduct(p => ({ ...p, brand: value }))}
                                            >
                                                <SelectTrigger className="bg-white shadow-sm">
                                                    <SelectValue placeholder="Select Brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map(brand => (
                                                        <SelectItem key={brand._id} value={brand._id}>
                                                        {brand.brandName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Category <span className="text-[#DF5C5D]">*</span></Label>
                                        <Select
                                            value={newProduct.category}
                                            onValueChange={value => setNewProduct(p => ({ ...p, category: value }))}
                                        >
                                            <SelectTrigger className="bg-white shadow-sm">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category._id} value={category._id}>
                                                {category.categoryName}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                            </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing and Stocking --------------------------------------------------------------------------------------------------*/}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-[16px] ml-3 font-semibold">Pricing and Stocking</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="col-span-8">
                            <div className="col-span-2 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                        newProduct.status ? "bg-green-500" : "bg-red-500"
                                        }`}
                                    />
                                    <span className="text-sm font-medium">
                                        {newProduct.status ? "In Stock" : "Out of Stock"}
                                    </span>
                                </div>

                                {/* Prices & VAT */}
                                <div className="flex flex-column gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Label className="text-sm font-medium">Selling Price <span className="text-[#DF5C5D]">*</span></Label>
                                        <Input
                                        type="number"
                                        value={newProduct.sellingPrice}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/[^0-9.]/g, "");
                                            if (value.length > 8) value = value.slice(0, 8);
                                            setNewProduct((prev) => ({
                                                ...prev,
                                                sellingPrice: value === "" ? 0 : parseFloat(value),
                                            }));
                                        }}
                                        min="0"
                                        step="0.01"
                                        className="bg-white shadow-sm"
                                        required
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Label className="text-sm font-medium">Price <span className="text-[#DF5C5D]">*</span></Label>
                                        <Input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => {
                                            // at most 8 digits
                                            let value = e.target.value.replace(/[^0-9.]/g, "");
                                            if (value.length > 8) value = value.slice(0, 8);
                                            setNewProduct((prev) => ({
                                                ...prev,  
                                                price: value === "" ? 0 : parseFloat(value),
                                            }));
                                        }}
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
                                            checked={newProduct.vat === 0}
                                            onChange={() => setNewProduct(p => ({ ...p, vat: 0 }))}
                                            className="accent-[#DF5C5D]"
                                        />
                                        NO VAT
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="vat"
                                            value={1}
                                            checked={newProduct.vat === 1}
                                            onChange={() => setNewProduct(p => ({ ...p, vat: 1 }))}
                                            className="accent-[#DF5C5D]"
                                        />
                                        VAT
                                        </label>
                                    </div>
                                </div>

                                <div className="">
                                    <Label className="text-sm font-medium">Stock Quantity <span className="text-[#DF5C5D]">*</span></Label>
                                    <Input
                                    type="number"
                                    value={newProduct.stocks}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/[^0-9]/g, "");
                                        if (value.length > 8) value = value.slice(0, 8);
                                        setNewProduct((prev) => ({
                                            ...prev,
                                            stocks: value === "" ? 0 : parseInt(value),
                                        }));
                                    }}
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