import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get("userid");
    const body = await req.json();

    if (!userId) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "User ID is required in headers.",
        },
      }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, body, { new: true });

    if (!updatedUser) {
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
        message: "User updated successfully.",
        body: {
          content: [updatedUser],
          message: "Success",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to update user.",
      },
    }, { status: 500 });
  }
}
