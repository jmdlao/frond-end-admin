import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserStoreLocation {
  storeID: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  gender: string;
  phoneNumber?: string;
  username: string;
  password: string;
  userType: number; // 1 = Admin, 2 = Manager, 3 = Cashier
  userStoreLocations: IUserStoreLocation[];
  createdAt: Date;
  updatedAt: Date;
}

const UserStoreLocationSchema = new Schema({
  storeID: { type: Schema.Types.ObjectId, ref: "Store" },
});

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    gender: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: Number, default: 1 },
    userStoreLocations: [UserStoreLocationSchema],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
