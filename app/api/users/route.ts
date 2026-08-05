import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const userType = searchParams.get("userType");

    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    if (userType) {
      query.userType = parseInt(userType);
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate("userStoreLocations.storeID", "storeName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        body: {
          content: users,
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
        message: error.message || "Failed to fetch users",
      },
    }, { status: 500 });
  }
}
