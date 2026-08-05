import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  productImage: string;
  productDescription: string;
  categoriesID: mongoose.Types.ObjectId;
  productBrandID: mongoose.Types.ObjectId;
  productQuantity: number;
  productPrice: number;
  productSellingPrice: number;
  productHasVat: number;
  productCode: string;
  productStatus: number;
  productThumbnail: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    productImage: { type: String, default: "" },
    productDescription: { type: String, default: "" },
    categoriesID: { type: Schema.Types.ObjectId, ref: "Category" },
    productBrandID: { type: Schema.Types.ObjectId, ref: "Brand" },
    productQuantity: { type: Number, default: 0 },
    productPrice: { type: Number, default: 0 },
    productSellingPrice: { type: Number, default: 0 },
    productHasVat: { type: Number, default: 0 },
    productCode: { type: String, required: true, unique: true },
    productStatus: { type: Number, default: 1 },
    productThumbnail: [{ type: String }],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
