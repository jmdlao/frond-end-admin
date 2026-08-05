import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const productId = req.headers.get("id");

    if (!productId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Product ID is required in headers.",
        },
      }, { status: 400 });
    }

    await Product.findByIdAndUpdate(productId, { isArchived: true });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Product deleted successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to delete product.",
      },
    }, { status: 500 });
  }
}
