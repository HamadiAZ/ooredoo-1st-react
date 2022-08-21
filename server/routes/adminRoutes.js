const router = require("express").Router();
const authAdmin = require("../middleware/authAdmin");
const pool = require("../db");
//            admin apis /////////////////////////////////////////////////////////

/* 
router : 
we specified in index.js that /api/admin are redirected to this router
so the paths here are built on top of the previous source : index.js
so for example /addShop here is in reality  /api/admin + /addShop 
 */

router.post("/addShop", authAdmin, async (req, res) => {
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
    console.error(error.message);
  }
});

router.get("/getMapPage", authAdmin, async (req, res) => {});

router.get("/getOrders", authAdmin, async (req, res) => {
  try {
    data = await pool.query("select * from orders");
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
  }
});

router.put("/DeleteOrder/:order_id", authAdmin, async (req, res) => {
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

module.exports = router;
