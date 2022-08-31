import { Router, Request, Response } from "express";
import fs from "fs";
import { pool } from "../db";
import { ShopObjectFromDbType, StoreObjectJSONType } from "../types/types";
const router = Router();
//            surfing apis /////////////////////////////////////////////////////////

//stores api
router.get("/getStores", async (req: Request, res: Response) => {
  try {
    const data = await pool.query("select * from stores");

    const rows: StoreObjectJSONType[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
  }
});

router.get(`/getGalleryListOfStore/:id`, (req: Request, res: Response) => {
  fs.readdir(`public/stores/${req.params.id}/gallery/`, (err, files) => {
    if (err) {
      res.json("Unable to scan directory: " + err);
      return "Unable to scan directory: " + err;
    }
    res.json(files);
  });
});

// shops api
router.get("/getShops/:id_store", async (req: Request, res: Response) => {
  try {
    const storeId: number = parseInt(req.params.id_store || "0");
    const data = await pool.query(`select * from shops where "store_id"='${storeId}'`);
    const rows: ShopObjectFromDbType[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

router.get("/getShopData/:id_shop", async (req: Request, res: Response) => {
  try {
    const data = await pool.query(`select * from shops where "id"='${req.params.id_shop}'`);
    const rows: ShopObjectFromDbType[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

module.exports = router;
