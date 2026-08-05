import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  categoryName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryName: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
