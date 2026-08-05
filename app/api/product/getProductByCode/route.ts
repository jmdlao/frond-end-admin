import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Brand from "@/lib/models/Brand";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const _c = Category;
    const _b = Brand;

    const { searchParams } = new URL(req.url);
    const productCode = searchParams.get("productCode");

    if (!productCode) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Product code is required.",
        },
      }, { status: 400 });
    }

    const product = await Product.findOne({ productCode })
      .populate("categoriesID", "categoryName")
      .populate("productBrandID", "brandName");

    if (!product) {
      return NextResponse.json({
        response: {
          code: 404,
          status: "ERROR",
          message: "Product not found.",
        },
      }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch product by code.",
      },
    }, { status: 500 });
  }
}
