import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const productId = req.headers.get("id");
    const body = await req.json();

    if (!productId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Product ID is required in headers.",
        },
      }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, body, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({
        response: {
          code: 404,
          status: "ERROR",
          message: "Product not found.",
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Product updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update product.",
      },
    }, { status: 500 });
  }
}
