const express = require("express"); // return a function
const request = require("request");
const app = express(); // run the express library
const cors = require("cors");
const pool = require("./db");

const fs = require("fs");
const { json } = require("express");
//MIDDLEWARE
app.use(cors());

app.use(express.json()); // to get the BODY of the request

// anytime we want the server to start we need to listen to port number
// so this is what keep our server running : LISTENING TO SMTH
// else it will do the code line by line and close , just run a file
app.listen(5000, () => {});

// server the public folder as default /
app.use(express.static("public"));

app.use(express.json()); //automatically handle json types on api request

//routes

//            admin apis /////////////////////////////////////////////////////////
app.post("/api/admin/addShop", async (req, res) => {
  try {
    let data = await req.body;
    const shopId = await pool.query(`
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
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

app.get("/api/admin/getMapPage", async (req, res) => {});

app.get("/api/admin/getOrders", async (req, res) => {
  try {
    data = await pool.query("select * from orders");
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.put("/api/admin/DeleteOrder/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    data = await pool.query(
      `DELETE FROM orders WHERE ("order_id"='${order_id}') RETURNING "order_id"`
    );
    res.json(data.fields);
  } catch (error) {
    console.error(error.message);
  }
});

//  stores api       /////////////////////////////////////////////////////////
app.get("/api/getStores", async (req, res) => {
  try {
    data = await pool.query("select * from stores");
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get(`/api/getGalleryListOfStore/:id`, (req, res) => {
  fs.readdir(`public/stores/${req.params.id}/gallery/`, (err, files) => {
    if (err) {
      res.json("Unable to scan directory: " + err);
      return "Unable to scan directory: " + err;
    }
    res.json(files);
  });
});

//           shops apis /////////////////////////////////////////////////////////
app.get("/api/getShops/:id_store", async (req, res) => {
  try {
    data = await pool.query(`select * from shops`);
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

app.get("/api/getShopData/:id_shop", async (req, res) => {
  try {
    data = await pool.query(`select * from shops where "id"='${req.params.id_shop}'`);
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
    res.send(JSON.stringify(error.message));
  }
});

app.post("/api/order/newOrder", async (req, res) => {
  try {
    let data = await req.body;
    //console.log(data);
    const newOrder = await pool.query(`
    INSERT INTO orders( shop_id, user_id, user_name, mdp,mdv,delivery_addr ,delivery_time,content)
     VALUES(
      '${data.shopId}',
      '${data.userId}',
      '${data.userName}',
      '${data.mdp}',
      '${data.mdv}',
      '${data.deliveryAddr}',
      '${data.deliveryTime}',
      '${JSON.stringify(data.content)}') RETURNING order_id,created_at ,delivery_time;
    `);

    res.send(newOrder.rows);
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

///// user authentication
