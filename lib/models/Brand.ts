import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrand extends Document {
  brandName: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    brandName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);

export default Brand;
