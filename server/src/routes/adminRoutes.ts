import { Router, Request, Response } from "express";
import authAdmin from "../middleware/authAdmin";
import { pool } from "../db";
import { orderFromDb } from "../types/types";
const router = Router();
//            admin apis /////////////////////////////////////////////////////////

router.post("/addShop", authAdmin, async (req: Request, res: Response) => {
  try {
    let data = await req.body;
    await pool.query(`
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
  } catch (error: any) {
    console.error(error.message);
  }
});

router.put("/ModifyOrder", authAdmin, async (req: Request, res: Response) => {
  try {
    let data = await req.body;
    const orderId = await pool.query(`
    UPDATE orders SET "status" = '${data.orderStatus}' WHERE "order_id"=${data.orderId} RETURNING "order_id";`);
    res.send(JSON.stringify(orderId));
  } catch (error: any) {
    console.error(error.message);
  }
});

router.get("/getMapPage", authAdmin, async (req: Request, res: Response) => {});

router.get("/getOrders", authAdmin, async (req: Request, res: Response) => {
  try {
    const data: any = await pool.query("select * from orders");
    const rows: orderFromDb[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
  }
});

router.put("/DeleteOrder/:order_id", authAdmin, async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const data: any = await pool.query(
      `DELETE FROM orders WHERE ("order_id"='${order_id}') RETURNING "order_id"`
    );
    const deletedOrderId: string | number = data.fields;
    res.json(deletedOrderId);
  } catch (error: any) {
    console.error(error.message);
  }
});

module.exports = router;
