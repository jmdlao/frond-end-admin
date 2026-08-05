import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Discount from "@/lib/models/Discount";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const discount = await Discount.create({
      discountName: body.discountName,
      discountType: body.discountType || 1,
      discountValue: body.discountValue,
    });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Discount created successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create discount.",
      },
    }, { status: 500 });
  }
}
