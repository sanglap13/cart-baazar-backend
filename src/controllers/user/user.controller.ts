import { NextFunction, Request, Response } from "express";
import UserModel from "../../models/user.model.js";
import { INewUserRequestBody } from "../../@types/interfaces/user.interface.js";
import { TryCatchWrapper } from "../../middlewares/errorHandler.js";
import ErrorHandler from "../../utils/services/errorHandler.js";

export const newUser = TryCatchWrapper(
  async (
    req: Request<{}, {}, INewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await UserModel.findById(_id);

    if (user)
      return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
      });

    if (!_id || !name || !email || !photo || !gender || !dob)
      return next(new ErrorHandler("Please add all fields", 400));

    user = await UserModel.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}!`,
    });
  }
);

export const getAllUsers = TryCatchWrapper(async (req, res, next) => {
  const users = await UserModel.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});

export const getUser = TryCatchWrapper(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);

  if (!user) return next(new ErrorHandler("Golu Beta, Invalid Id", 400));

  return res.status(200).json({
    success: true,
    user,
  });
});

export const deleteUser = TryCatchWrapper(async (req, res, next) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);

  if (!user) return next(new ErrorHandler("Golu Beta, Invalid Id", 400));

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
