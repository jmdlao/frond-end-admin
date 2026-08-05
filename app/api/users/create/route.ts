import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const existingUser = await User.findOne({ username: body.username });
    if (existingUser) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Username already exists.",
        },
      }, { status: 400 });
    }

    const newUser = await User.create({
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address || "",
      birthDate: body.birthDate || "",
      gender: body.gender || "",
      phoneNumber: body.phoneNumber || "",
      username: body.username,
      password: body.password,
      userType: body.userType || 1,
      userStoreLocations: body.userStoreLocations || [],
    });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "User created successfully.",
        body: {
          content: [newUser],
          message: "User created successfully.",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create user.",
      },
    }, { status: 500 });
  }
}
