const express = require("express"); // return a function
const app = express(); // run the express library

//const http = require("http").Server(app);
const http = require("http");
//const server = http.createServer(app);

const { Server } = require("socket.io");

const FRONT_END_LINK = "http://localhost:3000";

//const io = new Server(http, {
/* const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: [FRONT_END_LINK],
  },
}); */

/* io.on("connection", (socket) => {
  socket.on("hello", () => {
    console.log("hello received");
  });
}); */

const cors = require("cors");
const pool = require("./db");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const session = require("express-session"); // set cookie for every session

const fs = require("fs");

//MIDDLEWARE
app.use(
  cors({
    methods: ["GET", "POST", "PUT"],
    origin: [FRONT_END_LINK],
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
const server = app.listen(5000, () => {});
/* server.listen(5001, () => {
  console.log("listening on *:5000");
  
}); */

var io = require("socket.io")(server);

io.sockets.on("hello", function (socket) {
  console.log(socket);
  console.log("hello received");
});
// server the public folder as default /
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
