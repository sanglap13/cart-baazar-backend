import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/services/errorHandler.js";
import { TControllerType } from "../@types/controller.types.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatchWrapper =
  (func: TControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
