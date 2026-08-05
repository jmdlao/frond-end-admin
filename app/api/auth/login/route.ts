import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Username and password are required.",
          body: null,
        },
      }, { status: 400 });
    }

    let user = await User.findOne({ username });

    // Auto-seed default admin user if system has zero users
    if (!user) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        user = await User.create({
          firstName: "Admin",
          lastName: "User",
          username: username || "admin",
          password: password || "admin123",
          userType: 1, // Admin
          address: "Headquarters",
          gender: "Other",
        });
      }
    }

    if (!user || user.password !== password) {
      return NextResponse.json({
        response: {
          code: 401,
          status: "ERROR",
          message: "Invalid username or password.",
          body: null,
        },
      }, { status: 401 });
    }

    if (user.userType === 3) {
      return NextResponse.json({
        response: {
          code: 403,
          status: "ERROR",
          message: "Cashiers are not authorized to access the admin portal.",
          body: null,
        },
      }, { status: 403 });
    }

    const mockAccessToken = `token_${user._id}_${Date.now()}`;

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Login successful.",
        body: {
          content: "Authenticated successfully",
          accessToken: mockAccessToken,
          refreshToken: `refresh_${user._id}`,
          message: "Success",
          userType: user.userType,
        },
      },
    });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Internal server error",
        body: null,
      },
    }, { status: 500 });
  }
}
