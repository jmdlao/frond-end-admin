import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get("userid") || req.headers.get("userID");

    if (!userId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "User ID is required in headers.",
        },
      }, { status: 400 });
    }

    const user = await User.findById(userId).populate("userStoreLocations.storeID", "storeName");

    if (!user) {
      return NextResponse.json({
        response: {
          code: 404,
          status: "ERROR",
          message: "User not found.",
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: user,
          message: "User retrieved successfully.",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to fetch user.",
      },
    }, { status: 500 });
  }
}
