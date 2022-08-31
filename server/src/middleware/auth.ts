import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { JWTpassword } from "../const/const";

function auth(req: any, res: Response, next: NextFunction) {
  try {
    const { token } = req.cookies;
    if (!token) res.status(401).send({ errorMessage: "unauthorized" });
    const verified: any = jwt.verify(token, JWTpassword);

    req.userId = verified.userId;
    res.status(200).send({ authorized: "yes" });
    next(); //
  } catch (error: any) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
}

module.exports = auth;
