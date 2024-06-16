import { NextFunction, Request, Response } from "express";
import UserModel from "../../models/user.model.js";
import { INewUserRequestBody } from "../../@types/interfaces/user.interface.js";
import { TryCatchWrapper } from "../../middlewares/errorHandler.js";

export const newUser = TryCatchWrapper(
  async (
    req: Request<{}, {}, INewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    const user = await UserModel.create({
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
