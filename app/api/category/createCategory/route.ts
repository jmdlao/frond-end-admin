import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/lib/models/Category";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const category = await Category.create({ categoryName: body.categoryName });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Category created successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create category.",
      },
    }, { status: 500 });
  }
}
