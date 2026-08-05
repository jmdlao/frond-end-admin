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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.storeName = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const total = await Store.countDocuments(query);
    const stores = await Store.find(query)
      .populate("storeCashier.cashierID", "firstName lastName")
      .populate("storeProducts.productID", "productName productCode productPrice productSellingPrice productQuantity")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: stores,
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
        message: error.message || "Failed to fetch stores",
      },
    }, { status: 500 });
  }
}
