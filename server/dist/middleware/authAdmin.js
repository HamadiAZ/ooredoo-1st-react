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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";
//
function authAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.cookies;
            console.log(token);
            if (!token)
                res.status(401).send({ errorMessage: "unauthorized" });
            else {
                const verified = jsonwebtoken_1.default.verify(token, JWTpassword);
                try {
                    let id = verified === null || verified === void 0 ? void 0 : verified.userId;
                    const user = yield db_1.pool.query(`
          SELECT * from users where "id"='${id}';
          `);
                    const privilege = user.rows[0].privilege;
                    if (privilege != "admin")
                        res.status(401).send({ errorMessage: "you are not admin" });
                }
                catch (error) {
                    console.error(error.message);
                }
                next();
            }
        }
        catch (error) {
            console.error(error);
            res.status(401).send({ errorMessage: "unauthorized" });
        }
    });
}
exports.default = authAdmin;
