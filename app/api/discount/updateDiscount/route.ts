import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Discount from "@/lib/models/Discount";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const discountId = req.headers.get("discountid") || req.headers.get("id");
    const body = await req.json();

    await Discount.findByIdAndUpdate(discountId, body);

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Discount updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update discount.",
      },
    }, { status: 500 });
  }
}
