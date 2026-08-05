import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const existingProduct = await Product.findOne({ productCode: body.productCode });
    if (existingProduct) {
      return NextResponse.json({
        response: {
          code: 400,
          status: "ERROR",
          message: "Product code already exists.",
        },
      }, { status: 400 });
    }

    const newProduct = await Product.create({
      productName: body.productName,
      productImage: body.productImage || "",
      productDescription: body.productDescription || "",
      categoriesID: body.categoriesID || null,
      productBrandID: body.productBrandID || null,
      productQuantity: body.productQuantity || 0,
      productPrice: body.productPrice || 0,
      productSellingPrice: body.productSellingPrice || 0,
      productHasVat: body.productHasVat ? 1 : 0,
      productCode: body.productCode,
      productStatus: body.productStatus || 1,
      productThumbnail: body.productThumbnail || [],
    });

    return NextResponse.json({
      response: {
        code: 200,
        status: "SUCCESS",
        message: "Product created successfully.",
        body: newProduct,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      response: {
        code: 500,
        status: "ERROR",
        message: error.message || "Failed to create product.",
      },
    }, { status: 500 });
  }
}
