import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session"; // set cookie for every session
import { FRONT_END_LINK } from "./const/const";

const app = express(); // run the express library

//MIDDLEWARE
app.use(
  cors({
    methods: ["GET", "POST", "PUT"],
    origin: FRONT_END_LINK,
    credentials: true, //IMPORTANT
    //enable cookies
  })
);

app.use(
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
//
const io = require("socket.io")(server, options);
require("./sockets/sockets.js")(io, app);

//serve public folder
app.use(express.static("public"));

app.use(express.json()); //automatically handle json types on api request

//these 2 are for cookies to work
app.use(cookieParser()); // READ EVERY REQ
// AND PARSE COOKIES INTO REQ.COOKIES OBJECT IF THEY ARE COOKIES

app.use(bodyParser.urlencoded({ extended: true })); //why?

// APIs
//routers ////////////////
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/client", require("./routes/clientRoutes"));
app.use("/api/surf", require("./routes/surfingRoutes"));
