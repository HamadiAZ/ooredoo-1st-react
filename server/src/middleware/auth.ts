import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { JWTpassword } from "../const/const";

function auth(req: any, res: Response, next: NextFunction) {
  try {
    const { token } = req.cookies;
    if (!token) res.status(401).send({ errorMessage: "unauthorized" });
    const verified: any = jwt.verify(token, JWTpassword);
    /*
      if not verified : it will throw an error
      we are already in try catch and the error is unauthorized
      // so thats fine

      if verified :
      it will decode it , and we will get the PAYLOAD part to the const verified
      the payload OBJECT that we created the token with , here : usedId and the iat : issued at : time of creation

      SO NOW WE HAVE A userID , we can create property to req let name it userId
      and we can get the value from the next function that called auth
      like :
      app.get("/", auth, async (req, res) => {
             // here we can do req.userId cuz auth has been called already!!
          }

          auth is a middle ware so it has the next function
          that tell the caller (here app.get) to continue calling the next functions
          (here next means AUTH fn is finished , u can call async(req,res)=>...)
      */
    req.userId = verified.userId;
    res.status(200).send({ authorized: "yes" });
    next(); //
  } catch (error: any) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
}

module.exports = auth;
