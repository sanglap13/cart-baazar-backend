import { NextFunction, Request, Response } from "express";

export type TControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;
