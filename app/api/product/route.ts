import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Brand from "@/lib/models/Brand";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Ensure models are registered for population
    const _c = Category;
    const _b = Brand;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || searchParams.get("pageNumber") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const query: any = { isArchived: false };

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productCode: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("categoriesID", "categoryName")
      .populate("productBrandID", "brandName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: products,
          pagination: {
            total,
            limit,
            currentPage: page,
            totalPages,
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch products",
      },
    }, { status: 500 });
  }
}
