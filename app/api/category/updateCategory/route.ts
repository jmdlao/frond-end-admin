import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/lib/models/Category";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const categoryId = req.headers.get("category_id") || req.headers.get("categoryid");
    const body = await req.json();

    await Category.findByIdAndUpdate(categoryId, { categoryName: body.categoryName });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Category updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update category.",
      },
    }, { status: 500 });
  }
}
