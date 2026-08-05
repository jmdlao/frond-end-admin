import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const brand = await Brand.create({ brandName: body.brandName });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Brand created successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create brand.",
      },
    }, { status: 500 });
  }
}
