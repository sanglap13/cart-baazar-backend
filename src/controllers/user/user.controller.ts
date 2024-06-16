import { NextFunction, Request, Response } from "express";
import UserModel from "../../models/user.model.js";
import { INewUserRequestBody } from "../../@types/interfaces/user.interface.js";

export const newUser = async (
  req: Request<{}, {}, INewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, photo, gender, _id, dob } = req.body;

    const user = await UserModel.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }
};
