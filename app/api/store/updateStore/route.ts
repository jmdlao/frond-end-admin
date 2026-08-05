import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Store from "@/lib/models/Store";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const storeId = req.headers.get("storeid") || req.headers.get("store_id");
    const body = await req.json();

    if (!storeId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Store ID is required in headers.",
        },
      }, { status: 400 });
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, body, { new: true });

    if (!updatedStore) {
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
        message: "Store updated successfully.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update store.",
      },
    }, { status: 500 });
  }
}
