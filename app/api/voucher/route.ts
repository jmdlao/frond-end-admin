import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Voucher from "@/lib/models/Voucher";
import Store from "@/lib/models/Store";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const _s = Store;

    const { searchParams } = new URL(req.url);
    const page = parseInt(req.headers.get("page") || searchParams.get("page") || "1");
    const limit = 10;

    const skip = (page - 1) * limit;
    const total = await Voucher.countDocuments();
    const vouchers = await Voucher.find({})
      .populate("voucherStoreBranch.storeID", "storeName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: vouchers,
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
        message: error.message || "Failed to fetch vouchers.",
      },
    }, { status: 500 });
  }
}
