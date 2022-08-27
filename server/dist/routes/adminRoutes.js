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
const authAdmin_1 = __importDefault(require("../middleware/authAdmin"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
//            admin apis /////////////////////////////////////////////////////////
/*
router :
we specified in index.js that /api/admin are redirected to this router
so the paths here are built on top of the previous source : index.js
so for example /addShop here is in reality  /api/admin + /addShop
 */
router.post("/addShop", authAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield req.body;
        yield db_1.pool.query(`
      INSERT INTO shops( name, mdp, mdv, address,store_id ,schedule)
       VALUES(
        '${data.name}',
        '${JSON.stringify(data.mdp)}',
        '${JSON.stringify(data.mdv)}',
        '${JSON.stringify(data.address)}',
        '${data.store_id}',
        '${JSON.stringify(data.schedule)}');
      `);
        res.send(JSON.stringify("SHOP SAVED"));
    }
    catch (error) {
        console.error(error.message);
    }
}));
router.put("/ModifyOrder", authAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield req.body;
        const orderId = yield db_1.pool.query(`
    UPDATE orders SET "status" = '${data.orderStatus}' WHERE "order_id"=${data.orderId} RETURNING "order_id";`);
        res.send(JSON.stringify(orderId));
    }
    catch (error) {
        console.error(error.message);
    }
}));
router.get("/getMapPage", authAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
router.get("/getOrders", authAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.pool.query("select * from orders");
        const rows = data.rows;
        res.json(rows);
    }
    catch (error) {
        console.error(error.message);
    }
}));
router.put("/DeleteOrder/:order_id", authAdmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id } = req.params;
        const data = yield db_1.pool.query(`DELETE FROM orders WHERE ("order_id"='${order_id}') RETURNING "order_id"`);
        const deletedOrderId = data.fields;
        res.json(deletedOrderId);
    }
    catch (error) {
        console.error(error.message);
    }
}));
module.exports = router;
