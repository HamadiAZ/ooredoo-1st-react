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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session")); // set cookie for every session
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./db");
const app = (0, express_1.default)(); // run the express library
const FRONT_END_LINK = "http://localhost:3000";
//MIDDLEWARE
app.use((0, cors_1.default)({
    methods: ["GET", "POST", "PUT"],
    origin: [FRONT_END_LINK],
    credentials: true, //IMPORTANT
    //enable cookies
}));
typeof app.use((0, express_session_1.default)({
    secret: "test",
    resave: false,
    saveUninitialized: false,
    cookie: {},
}));
app.use(express_1.default.json());
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
const server = http_1.default.createServer(app);
server.listen(5000, () => {
    console.log("listening on *:5000");
});
// sockets
//process.setMaxListeners(0);
const io = require("socket.io")(server, options);
require("./sockets/sockets.js")(io, app);
app.use(express_1.default.static("public"));
app.use(express_1.default.json()); //automatically handle json types on api request
//these 2 are for cookies to work
app.use((0, cookie_parser_1.default)()); // READ EVERY REQ
// AND PARSE COOKIES INTO REQ.COOKIES OBJECT IF THEY ARE COOKIES
app.use(body_parser_1.default.urlencoded({ extended: true })); //why?
//routes
//routers ////////////////
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
//  stores api       /////////////////////////////////////////////////////////
app.get("/api/getStores", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.pool.query("select * from stores");
        const rows = data.rows;
        res.json(rows);
    }
    catch (error) {
        console.error(error.message);
    }
}));
app.get(`/api/getGalleryListOfStore/:id`, (req, res) => {
    fs_1.default.readdir(`public/stores/${req.params.id}/gallery/`, (err, files) => {
        if (err) {
            res.json("Unable to scan directory: " + err);
            return "Unable to scan directory: " + err;
        }
        res.json(files);
    });
});
//           shops apis /////////////////////////////////////////////////////////
app.get("/api/getShops/:id_store", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.pool.query(`select * from shops`);
        const rows = data.rows;
        res.json(rows);
    }
    catch (error) {
        console.error(error.message);
        res.send(JSON.stringify(error.message));
    }
}));
app.get("/api/getShopData/:id_shop", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.pool.query(`select * from shops where "id"='${req.params.id_shop}'`);
        const rows = data.rows;
        res.json(rows);
    }
    catch (error) {
        console.error(error.message);
        res.send(JSON.stringify(error.message));
    }
}));
app.get("/api/client/getOrders/:id_user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.pool.query(`select * from orders where "user_id"='${req.params.id_user}'`);
        const rows = data.rows;
        res.json(rows);
    }
    catch (error) {
        console.error(error.message);
        res.send(JSON.stringify(error.message));
    }
}));
app.post("/api/order/newOrder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield req.body;
        //console.log(data);
        const newOrder = yield db_1.pool.query(`
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
    }
    catch (error) {
        res.send(JSON.stringify("error " + error.message));
        console.error(error.message);
    }
}));
app.put("/api/client/updateClientOrdersStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = req.body;
        //console.log(data);
        if (data.length) {
            const order = data[0];
            //console.log(order)
            data.forEach((order) => __awaiter(void 0, void 0, void 0, function* () {
                yield db_1.pool.query(`
          UPDATE orders SET "status" = '${order.status}' 
          WHERE ("order_id"=${order.order_id});`);
            }));
        }
        res.send(JSON.stringify(data.length + "order status updated successfully"));
    }
    catch (error) {
        console.error(error.message);
    }
}));
app.put("/api/client/DeleteOrder/:order_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id } = req.params;
        const { client_id } = req.body;
        const data = yield db_1.pool.query(`DELETE FROM orders WHERE ("order_id"='${order_id}' AND "user_id"='${client_id}') RETURNING "order_id"`);
        res.json(data.fields);
    }
    catch (error) {
        console.error(error.message);
    }
}));
/* yarn install

yarn add @types/express */
