import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreCashier {
  cashierID: mongoose.Types.ObjectId;
}

export interface IStoreProduct {
  productID: mongoose.Types.ObjectId;
  productQuantity: number;
}

export interface IStore extends Document {
  storeName: string;
  storeLocation: string;
  storeOpenClosing: string;
  storeCashier: IStoreCashier[];
  storeProducts: IStoreProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const StoreCashierSchema = new Schema({
  cashierID: { type: Schema.Types.ObjectId, ref: "User" },
});

const StoreProductSchema = new Schema({
  productID: { type: Schema.Types.ObjectId, ref: "Product" },
  productQuantity: { type: Number, default: 0 },
});

const StoreSchema = new Schema<IStore>(
  {
    storeName: { type: String, required: true },
    storeLocation: { type: String, default: "" },
    storeOpenClosing: { type: String, default: "" },
    storeCashier: [StoreCashierSchema],
    storeProducts: [StoreProductSchema],
  },
  { timestamps: true }
);

export const Store: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);

export default Store;
