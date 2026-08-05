import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoucherTagId {
  brandID?: mongoose.Types.ObjectId;
  categoryID?: mongoose.Types.ObjectId;
}

export interface IVoucher extends Document {
  voucherName: string;
  voucherType: number;
  voucherCategory: number;
  voucherValue: number;
  voucherCode: string;
  voucherStatus: number;
  voucherStoreBranch: {
    storeID: mongoose.Types.ObjectId;
  };
  voucherStartDate: string;
  voucherEndDate: string;
  voucherLimit: number;
  voucherTagID: IVoucherTagId[];
  createdAt: Date;
  updatedAt: Date;
}

const VoucherTagIdSchema = new Schema({
  brandID: { type: Schema.Types.ObjectId, ref: "Brand" },
  categoryID: { type: Schema.Types.ObjectId, ref: "Category" },
});

const VoucherSchema = new Schema<IVoucher>(
  {
    voucherName: { type: String, required: true },
    voucherType: { type: Number, default: 1 },
    voucherCategory: { type: Number, default: 1 },
    voucherValue: { type: Number, required: true },
    voucherCode: { type: String, required: true, unique: true },
    voucherStatus: { type: Number, default: 1 },
    voucherStoreBranch: {
      storeID: { type: Schema.Types.ObjectId, ref: "Store" },
    },
    voucherStartDate: { type: String, default: "" },
    voucherEndDate: { type: String, default: "" },
    voucherLimit: { type: Number, default: 100 },
    voucherTagID: [VoucherTagIdSchema],
  },
  { timestamps: true }
);

export const Voucher: Model<IVoucher> =
  mongoose.models.Voucher || mongoose.model<IVoucher>("Voucher", VoucherSchema);

export default Voucher;
