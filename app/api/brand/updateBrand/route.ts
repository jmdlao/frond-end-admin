import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const brandId = req.headers.get("id") || req.headers.get("brandID");
    const body = await req.json();

    await Brand.findByIdAndUpdate(brandId, { brandName: body.brandName });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Brand updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update brand.",
      },
    }, { status: 500 });
  }
}
