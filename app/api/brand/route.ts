import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({}).sort({ brandName: 1 });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: brands,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch brands.",
      },
    }, { status: 500 });
  }
}
