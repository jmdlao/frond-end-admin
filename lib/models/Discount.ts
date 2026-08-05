import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  discountName: string;
  discountType: number;
  discountValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    discountName: { type: String, required: true },
    discountType: { type: Number, default: 1 },
    discountValue: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Discount: Model<IDiscount> =
  mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);

export default Discount;
