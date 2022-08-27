import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";
import { pool } from "../db";

const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";

//

export default async function authAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.cookies;
    console.log(token);
    if (!token) res.status(401).send({ errorMessage: "unauthorized" });
    else {
      const verified: any = jwt.verify(token, JWTpassword);
      try {
        let id = verified?.userId;
        const user = await pool.query(`
          SELECT * from users where "id"='${id}';
          `);
        const privilege = user.rows[0].privilege;
        if (privilege != "admin") res.status(401).send({ errorMessage: "you are not admin" });
      } catch (error: any) {
        console.error(error.message);
      }
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
}
