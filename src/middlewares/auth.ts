import UserModel from "../models/user.model.js";
import ErrorHandler from "../utils/services/errorHandler.js";
import { TryCatchWrapper } from "./errorHandler.js";

export const adminOnlyAccess = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("Golu Beta, Login Karo phle!", 401));

  const user = await UserModel.findById(id);
  if (!user)
    return next(new ErrorHandler("Golu Beta, Fake ID nahi dete!", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("Golu Beta, masti nahi!", 403));

  next();
});
