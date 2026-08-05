import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ categoryName: 1 });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: categories,
          pagination: {
            total: categories.length,
            limit: categories.length,
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch categories.",
      },
    }, { status: 500 });
  }
}
