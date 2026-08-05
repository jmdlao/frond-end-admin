import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Discount from "@/lib/models/Discount";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    const skip = (page - 1) * limit;
    const total = await Discount.countDocuments();
    const discounts = await Discount.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: discounts,
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
        message: error.message || "Failed to fetch discounts.",
      },
    }, { status: 500 });
  }
}
