import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import Brand from "@/lib/models/Brand";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    // 1. Seed Admin User
    let admin = await User.findOne({ username: "admin" });
    if (!admin) {
      admin = await User.create({
        firstName: "System",
        lastName: "Administrator",
        username: "admin",
        password: "password123",
        userType: 1,
        address: "Head Office",
        gender: "Male",
        phoneNumber: "1234567890",
      });
    }

    // 2. Seed Categories
    const categoryNames = ["Electronics", "Beverages", "Snacks", "Household"];
    for (const name of categoryNames) {
      await Category.updateOne({ categoryName: name }, { categoryName: name }, { upsert: true });
    }

    // 3. Seed Brands
    const brandNames = ["Samsung", "Coca-Cola", "Nestle", "LG"];
    for (const name of brandNames) {
      await Brand.updateOne({ brandName: name }, { brandName: name }, { upsert: true });
    }

    // 4. Seed Store Branch
    let store = await Store.findOne({ storeName: "Main Branch" });
    if (!store) {
      store = await Store.create({
        storeName: "Main Branch",
        storeLocation: "123 Central Ave, Metro City",
        storeOpenClosing: "08:00 AM - 10:00 PM",
        storeCashier: [{ cashierID: admin._id }],
      });
    }

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Database seeded successfully.",
        body: {
          adminUser: admin.username,
          store: store.storeName,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Seeding failed.",
      },
    }, { status: 500 });
  }
}
