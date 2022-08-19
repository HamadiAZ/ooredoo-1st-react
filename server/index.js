const express = require("express"); // return a function
const bcrypt = require("bcrypt");
//yarn add express-session body-parser cookie-parser

const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db");

const auth = require("./middleware/auth");
const authAdmin = require("./middleware/authAdmin");

const app = express(); // run the express library

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const session = require("express-session"); // set cookie for every session

const fs = require("fs");

//MIDDLEWARE
app.use(
  cors({
    methods: ["GET", "POST", "PUT"],
    origin: ["http://localhost:3000"],
    credentials: true, //IMPORTANT
    //enable cookies
  })
);

//this middleware will fire for every request to the server!!
app.use(
  session({
    // session info
    key: "userId",
    secret: "test", //this key will sign the cookie
    resave: false, // resave : every request will have a new session
    // even if its from the same client / browser
    // we dont want that
    saveUninitialized: false, //why?
    // if we didnt modify the session , we dont want it to save ???

    cookie: {
      expires: 60 * 60 * 8, //time is seconds
    },
  })
); // so now this middleware will create session key in every
// req object ( we can use req.session in every api definition)

app.use(express.json());
// app.use("path0",fn)
//for any request to "path" do the fn
// here no path is specified so express.json() will work on all requests
// express.json() read the req header , if type is application/json
// it will parse it automatically !
// so we don't need to do JSON.parse(req.body)

// anytime we want the server to start we need to listen to port number
// so this is what keep our server running : LISTENING TO SMTH
// else it will do the code line by line and close , just run a file
app.listen(5000, () => {});

// server the public folder as default /
app.use(express.static("public"));

app.use(express.json()); //automatically handle json types on api request

//these 2 are for cookies to work
app.use(cookieParser()); // READ EVERY REQ
// AND PARSE COOKIES INTO REQ.COOKIES OBJECT IF THEY ARE COOKIES

app.use(bodyParser.urlencoded({ extended: true })); //why?
const JWTpassword = "e98fZf4eGeEbergre2zaFSSFS81FF8FZ7e";

//routes

//routers ////////////////
//            admin apis /////////////////////////////////////////////////////////
app.post("/api/admin/addShop", authAdmin, async (req, res) => {
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

app.get("/api/admin/getMapPage", authAdmin, async (req, res) => {});

app.get("/api/admin/getOrders", authAdmin, async (req, res) => {
  try {
    data = await pool.query("select * from orders");
    res.json(data.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.put("/api/admin/DeleteOrder/:order_id", authAdmin, async (req, res) => {
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

app.post("/api/auth/reg", async (req, res) => {
  try {
    let data = await req.body;
    //console.log(data);
    let newUser = {};
    bcrypt.hash(data.password, 10, async (err, hash) => {
      if (err) console.log(err);
      newUser = await pool.query(`
      INSERT INTO users(name,email,username,password,privilege)
       VALUES(
        '${data.name}',
        '${data.email}',
        '${data.username}',
        '${hash}',
        '${"user"}') RETURNING username;
      `);
      if (newUser.hasOwnProperty("rows")) {
        const token = jwt.sign({ userId: newUser.rows[0].username }, JWTpassword);

        // send it in cookie ,and not any cookie: HTTP-only cookie
        // so it cant be accessed via JS in the browser (offline / if hacker injected code to Frontend)
        // where normal cookies are like local storage : can be accessed by js
        //res.cookie("name",value,optionObject) : define a cookie

        const cookieOptions = {
          httpOnly: true, // http cookie for security
        };
        res.cookie("token", token, cookieOptions).send({ username: user.rows[0].username });
      } else res.send({ username: "" });
    });
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

/*
//Session login 
app.get("/api/auth/login", async (req, res) => {
  //console.log(req.session.id);
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
}); */

app.get("/api/auth/loginStatus", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(200).send({ isLoggedIn: false, privilege: "user" });
    } else {
      const verified = jwt.verify(token, JWTpassword);
      const isAdmin = false;

      console.log(verified);
      let id = verified.userId;
      const user = await pool.query(`
          SELECT * from users where "id"='${id}';
          `);
      const privilege = user.rows[0].privilege;
      const name = user.rows[0].name;
      const username = user.rows[0].username;
      if (privilege === "admin")
        res
          .status(200)
          .send({ isLoggedIn: true, privilege: "admin", name: name, username: username });
      else
        res
          .status(200)
          .send({ isLoggedIn: true, privilege: "user", name: name, username: username });
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ errorMessage: "unauthorized" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    let data = await req.body;
    //console.log(data);
    const user = await pool.query(`
    SELECT * from users where "email"='${data.email}';
    `);
    if (user.rows.length) {
      const userId = user.rows[0].id;
      bcrypt.compare(data.password, user.rows[0].password, (err, resolve) => {
        if (resolve) {
          // create token
          const token = jwt.sign({ userId: userId }, JWTpassword);
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
        } else {
          res.send({ username: "" });
        }
      });
    } else {
      console.log("user doesnt  exist");
      res.send({ username: "" });
    }
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

app.get("/api/auth/logout", (req, res) => {
  try {
    const cookieOptions = { httpOnly: true, expires: new Date(0) };
    res.cookie("token", "", cookieOptions).send({ username: "" });
    //"token", "", the "" cuz value is needed to avoid compiling error
    // so the token cookie will be token : ""
    //but we can delete it entirely when it already expired :
    // the browser will delete it automatically
    // so we do date(0) somewhere in 1970 : in the past
    // its expired , will be deleted then
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});

app.get(`/api/auth/getMail:email`, async (req, res) => {
  try {
    let email = req.params.email;
    //console.log(email);
    const user = await pool.query(`
    SELECT * from users where "email"='${email}';
    `);
    //console.log(user.rows[0]);
    user.rows?.length ? res.send({ email: user.rows[0].email }) : res.send({ email: "" });
  } catch (error) {
    res.send(JSON.stringify("error " + error.message));
    console.error(error.message);
  }
});
