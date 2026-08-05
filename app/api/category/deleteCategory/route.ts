import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/lib/models/Category";

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const categoryId = req.headers.get("category_id") || req.headers.get("categoryid");

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Category deleted successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to delete category.",
      },
    }, { status: 500 });
  }
}
