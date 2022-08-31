import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session"; // set cookie for every session
import fs from "fs";

import { pool } from "./db";
import {
  loggedInStateType,
  orderFromDb,
  orderToDb,
  ShopObjectFromDbType,
  StoreObjectJSONType,
} from "./types/types";

const app = express(); // run the express library

const FRONT_END_LINK = "http://localhost:3000";

//MIDDLEWARE
app.use(
  cors({
    methods: ["GET", "POST", "PUT"],
    origin: [FRONT_END_LINK],
    credentials: true, //IMPORTANT
    //enable cookies
  })
);

typeof app.use(
  session({
    secret: "test", //this key will sign the cookie
    resave: false, // resave : every request will have a new session
    saveUninitialized: false,
    cookie: {},
  })
);

app.use(express.json());
const options = {
  serveClient: true,
  pingInterval: 10000,
  pingTimeout: 600000,
  cookie: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
};

const server = http.createServer(app);

server.listen(5000, () => {
  console.log("listening on *:5000");
});

// sockets
//process.setMaxListeners(0);
const io = require("socket.io")(server, options);
require("./sockets/sockets.js")(io, app);

app.use(express.static("public"));

app.use(express.json()); //automatically handle json types on api request

//these 2 are for cookies to work
app.use(cookieParser()); // READ EVERY REQ
// AND PARSE COOKIES INTO REQ.COOKIES OBJECT IF THEY ARE COOKIES

app.use(bodyParser.urlencoded({ extended: true })); //why?

//routes

//routers ////////////////
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

//  stores api       /////////////////////////////////////////////////////////
app.get("/api/getStores", async (req: Request, res: Response) => {
  try {
    const data = await pool.query("select * from stores");

    const rows: StoreObjectJSONType[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
  }
});

app.get(`/api/getGalleryListOfStore/:id`, (req: Request, res: Response) => {
  fs.readdir(`public/stores/${req.params.id}/gallery/`, (err, files) => {
    if (err) {
      res.json("Unable to scan directory: " + err);
      return "Unable to scan directory: " + err;
    }
    res.json(files);
  });
});

//           shops apis /////////////////////////////////////////////////////////
app.get("/api/getShops/:id_store", async (req: Request, res: Response) => {
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

app.get("/api/getShopData/:id_shop", async (req: Request, res: Response) => {
  try {
    const data = await pool.query(`select * from shops where "id"='${req.params.id_shop}'`);
    const rows: ShopObjectFromDbType[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

app.get("/api/client/getOrders/:id_user", async (req: Request, res: Response) => {
  try {
    const data = await pool.query(`select * from orders where "user_id"='${req.params.id_user}'`);
    const rows: orderFromDb[] = data.rows;
    res.json(rows);
  } catch (error: any) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

app.post("/api/order/newOrder", async (req: Request, res: Response) => {
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

app.put("/api/client/updateClientOrdersStatus", async (req: Request, res: Response) => {
  try {
    let data: orderFromDb[] = req.body;
    //console.log(data);
    if (data.length) {
      const order = data[0];
      //console.log(order)
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

app.put("/api/client/DeleteOrder/:order_id", async (req: Request, res: Response) => {
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

/* yarn install 

yarn add @types/express */
