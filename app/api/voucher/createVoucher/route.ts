import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Voucher from "@/lib/models/Voucher";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const voucher = await Voucher.create({
      voucherName: body.voucherName,
      voucherType: body.voucherType || 1,
      voucherCategory: body.voucherCategory || 1,
      voucherValue: body.voucherValue,
      voucherCode: body.voucherCode,
      voucherStatus: body.voucherStatus || 1,
      voucherStoreBranch: body.voucherStoreBranch || {},
      voucherStartDate: body.voucherStartDate || "",
      voucherEndDate: body.voucherEndDate || "",
      voucherLimit: body.voucherLimit || 100,
      voucherTagID: body.voucherTagID ? [body.voucherTagID] : [],
    });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Voucher created successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create voucher.",
      },
    }, { status: 500 });
  }
}
