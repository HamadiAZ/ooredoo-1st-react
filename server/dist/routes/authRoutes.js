"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";
const router = (0, express_1.Router)();
router.post("/reg", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield req.body;
        //console.log(data);
        let newUser = {};
        bcrypt_1.default.hash(data.password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                console.log(err);
            newUser = yield db_1.pool.query(`
        INSERT INTO users(name,email,username,password,privilege)
         VALUES(
          '${data.name}',
          '${data.email}',
          '${data.username}',
          '${hash}',
          '${"user"}') RETURNING username;
        `);
            if (newUser.hasOwnProperty("rows")) {
                const token = jsonwebtoken_1.default.sign({ userId: newUser.rows[0].username }, JWTpassword);
                // send it in cookie ,and not any cookie: HTTP-only cookie
                // so it cant be accessed via JS in the browser (offline / if hacker injected code to Frontend)
                // where normal cookies are like local storage : can be accessed by js
                //res.cookie("name",value,optionObject) : define a cookie
                const cookieOptions = {
                    httpOnly: true, // http cookie for security
                };
                res.cookie("token", token, cookieOptions).send({ username: newUser.rows[0].username });
            }
            else
                res.send({ username: "" });
        }));
    }
    catch (error) {
        res.send(JSON.stringify("error " + error.message));
        console.error(error.message);
    }
}));
/*
  //Session login
  router.get("/login", async (req, res) => {
    //console.log(req.session.id);
    if (req.session.user) {
      res.send({ loggedIn: true, user: req.session.user });
    } else {
      res.send({ loggedIn: false });
    }
  }); */
router.get("/loginStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.cookies;
        if (!token) {
            res.status(200).send({ isLoggedIn: false, privilege: "user" });
        }
        else {
            const verified = jsonwebtoken_1.default.verify(token, JWTpassword);
            // console.log(verified);
            let id = verified.userId;
            const user = yield db_1.pool.query(`
            SELECT * from users where "id"='${id}';
            `);
            const privilege = user.rows[0].privilege;
            const name = user.rows[0].name;
            const username = user.rows[0].username;
            if (privilege === "admin")
                res
                    .status(200)
                    .send({ isLoggedIn: true, privilege: "admin", name: name, username: username, id });
            else
                res
                    .status(200)
                    .send({ isLoggedIn: true, privilege: "user", name: name, username: username, id });
        }
    }
    catch (error) {
        console.error(error);
        res.status(401).send({ errorMessage: "unauthorized" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield req.body;
        //console.log(data);
        const user = yield db_1.pool.query(`
      SELECT * from users where "email"='${data.email}';
      `);
        if (user.rows.length) {
            const userId = user.rows[0].id;
            bcrypt_1.default.compare(data.password, user.rows[0].password, (err, resolve) => {
                if (resolve) {
                    // create token
                    const token = jsonwebtoken_1.default.sign({ userId: userId }, JWTpassword);
                    // send it in cookie ,and not any cookie: HTTP-only cookie
                    // so it cant be accessed via JS in the browser (offline / if hacker injected code to Frontend)
                    // where normal cookies are like local storage : can be accessed by js
                    //res.cookie("name",value,optionObject) : define a cookie
                    const cookieOptions = {
                        httpOnly: true, // http cookie for security
                    };
                    //session
                    //req.session.user = user;
                    //console.log(req.session.user);
                    res.cookie("token", token, cookieOptions).send({ username: user.rows[0].username });
                }
                else {
                    res.send({ username: "" });
                }
            });
        }
        else {
            console.log("user doesnt  exist");
            res.send({ username: "" });
        }
    }
    catch (error) {
        res.send(JSON.stringify("error " + error.message));
        console.error(error.message);
    }
}));
router.get("/logout", (req, res) => {
    try {
        const cookieOptions = { httpOnly: true, expires: new Date(0) };
        res.cookie("token", "", cookieOptions).send({ username: "" });
        //"token", "", the "" cuz value is needed to avoid compiling error
        // so the token cookie will be token : ""
        //but we can delete it entirely when it already expired :
        // the browser will delete it automatically
        // so we do date(0) somewhere in 1970 : in the past
        // its expired , will be deleted then
    }
    catch (error) {
        res.send(JSON.stringify("error " + error.message));
        console.error(error.message);
    }
});
router.get(`/getMail:email`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let email = req.params.email;
        //console.log(email);
        const user = yield db_1.pool.query(`
      SELECT * from users where "email"='${email}';
      `);
        //console.log(user.rows[0]);
        ((_a = user.rows) === null || _a === void 0 ? void 0 : _a.length) ? res.send({ email: user.rows[0].email }) : res.send({ email: "" });
    }
    catch (error) {
        res.send(JSON.stringify("error " + error.message));
        console.error(error.message);
    }
}));
module.exports = router;
