import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Voucher from "@/lib/models/Voucher";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const voucherId = req.headers.get("voucherid") || req.headers.get("id");
    const body = await req.json();

    await Voucher.findByIdAndUpdate(voucherId, body);

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Voucher updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update voucher.",
      },
    }, { status: 500 });
  }
}
