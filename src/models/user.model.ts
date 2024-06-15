import { model } from "mongoose";
import { UserSchema } from "./schemas/user.schema.js";
import { IUser } from "../@types/interfaces/user.interface.js";

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
