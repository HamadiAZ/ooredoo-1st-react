import { Router, Request, Response } from "express";
import cors from "cors";
import { pool } from "../db";
import { loggedInStateType, orderFromDb, orderToDb } from "../types/types";
import { corsOptions } from "../const/const";
const router = Router();

//            client apis /////////////////////////////////////////////////////////

router.use(cors(corsOptions));

router.put("/updateClientOrdersStatus", async (req: Request, res: Response) => {
  try {
    let data: orderFromDb[] = req.body;
    if (data.length) {
      data.forEach(async (order) => {
        await pool.query(`
          UPDATE orders SET "status" = '${order.status}' 
          WHERE ("order_id"=${order.order_id});`);
      });
    }
    res.send(JSON.stringify(data.length + "order status updated successfully"));
  } catch (error: any) {
    console.error(error.message);
  }
});

router.put("/DeleteOrder/:order_id", async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { client_id } = req.body as { client_id: loggedInStateType["id"] };
    const data = await pool.query(
      `DELETE FROM orders WHERE ("order_id"='${order_id}' AND "user_id"='${client_id}') RETURNING "order_id"`
    );
    res.json(data.fields);
  } catch (error: any) {
    console.error(error.message);
  }
});

router.post("/newOrder", async (req: Request, res: Response) => {
  try {
    const data: orderToDb = await req.body;
    //console.log(data);
    const newOrder = await pool.query(`
    INSERT INTO orders( shop_id, user_id, user_name, mdp,mdv,delivery_addr ,delivery_time,content,status)
     VALUES(
      '${data.shopId}',
      '${data.userId}',
      '${data.userName}',
      '${data.mdp}',
      '${data.mdv}',
      '${data.deliveryAddr}',
      '${data.deliveryTime}',
      '${JSON.stringify(data.content)}',
      '${data.status}')
       RETURNING order_id,created_at ,delivery_time;
    `);
    res.send(newOrder.rows);
  } catch (error: any) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

router.get("/getOrders/:id_user", async (req: Request, res: Response) => {
  try {
    const data = await pool.query(`select * from orders where "user_id"='${req.params.id_user}'`);
    const rows: orderFromDb[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

module.exports = router;
