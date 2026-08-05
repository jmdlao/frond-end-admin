import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Store from "@/lib/models/Store";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const newStore = await Store.create({
      storeName: body.storeName,
      storeLocation: body.storeLocation || "",
      storeOpenClosing: body.storeOpenClosing || "",
      storeCashier: body.storeCashier || [],
      storeProducts: body.storeProducts || [],
    });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Store created successfully.",
        body: newStore,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create store.",
      },
    }, { status: 500 });
  }
}
