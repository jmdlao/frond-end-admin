import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const brandId = req.headers.get("id") || req.headers.get("brandID");

    await Brand.findByIdAndDelete(brandId);

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Brand deleted successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to delete brand.",
      },
    }, { status: 500 });
  }
}
