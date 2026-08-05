import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Store from "@/lib/models/Store";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const _u = User;
    const _p = Product;

    const storeId = req.headers.get("storeid") || req.headers.get("store_id");

    if (!storeId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Store ID is required in headers.",
        },
      }, { status: 400 });
    }

    const store = await Store.findById(storeId)
      .populate("storeCashier.cashierID", "firstName lastName")
      .populate("storeProducts.productID", "productName productCode productPrice productSellingPrice productQuantity");

    if (!store) {
      return NextResponse.json({
        response: {
          code: 404,
          status: "ERROR",
          message: "Store not found.",
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: store,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch store details.",
      },
    }, { status: 500 });
  }
}
