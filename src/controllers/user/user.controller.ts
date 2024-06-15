import { NextFunction, Request, Response } from "express";
import UserModel from "../../models/user.model.js";

export const newUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {} = req.body;

    const user = await UserModel.create({});

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
    });
  } catch (error) {}
};
