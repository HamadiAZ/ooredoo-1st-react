const pool = require("../db");
const { v4: uuid } = require("uuid");
async function getAdminsId() {
  try {
    data = await pool.query(`select "id" from users where "privilege"='admin'`);
    return data.rows.map((item) => item.id);
  } catch (error) {
    console.error(error.message);
  }
}
module.exports = async function (io) {
  /*   io.on("connection", (socket) => {
    connectedUsers;
    socket.on("join_room", (data) => socket.join(data));
    socket.on("checkout", (loginStatus, dataBody) => {
      console.log(loginStatus, dataBody);
    });
    socket.on("shop", (loginStatus, { id }) => {
      console.log(loginStatus, id);
    });
    socket.on("messagee", (test, test1) => {
      console.log(socket.id);
    });
    var clientsList = io.sockets.adapter.rooms[21];
    var numClients = clientsList?.length;
    console.log(numClients);
  }); */

  let onlineAdmins = [];
  // [   [ADMINsocketID,ShopID] , [ADMINsocketID,ShopID] ...]

  io.on("connection", async (socket) => {
    //
    socket.on("disconnect", function () {
      // if its admin : delete it from the onlineAdmins
      let isItAdmin = "client";
      onlineAdmins = onlineAdmins.filter((ADMINsocketID) => {
        if (ADMINsocketID[0] === socket.id) isItAdmin = "admin";
        return ADMINsocketID[0] != socket.id;
      });
      //console.log(`disconnected ${isItAdmin} id :`, socket.id);
    });

    socket.on("shop-admin-is-online", (shopId) => {
      // setting online admins MAP
      onlineAdmins.push([socket.id, shopId]);
      //socket.join(shopId);
      //console.log("admin connected with id" + socket.id);
      //socket.in(30).emit("message", 5000);
      console.log("connected admins array :", onlineAdmins);
    });

    socket.on("checkout-prompt-from-client", (data) => {
      const { shopId } = data;
      orderId = uuid();
      // admins online
      onlineAdmins.forEach((adminInfo) => {
        if (shopId == adminInfo[1])
          socket
            .to(adminInfo[0])
            .emit("new-order-to-shop-admins", adminInfo[0], socket.id, data, orderId);
      });
      //response of admins availability
      // if front i will check if onlineAdmins of this shop=[] then no admin is online
      const onlineAdminsOfRequestedShop = onlineAdmins.filter((item) => item[1] == shopId);
      console.log("requested admins array", onlineAdminsOfRequestedShop);
      socket.emit("admins-availability", onlineAdminsOfRequestedShop, orderId);
    });

    socket.on("order-confirmation", (isConfirmed, clientId) => {
      socket.to(clientId).emit("order-confirmation-to-user", isConfirmed);
    });

    socket.on("cancel-order-after-sent", (orderId, shopId) => {
      console.log("cancel : ", orderId);
      onlineAdmins.forEach((adminInfo) => {
        if (shopId == adminInfo[1])
          socket.to(adminInfo[0]).emit("cancel-pending-order-admin", orderId, socket.id);
      });
    });

    socket.on("pending-order-canceling-confirmation", (orderId, clientId) => {
      socket.to(clientId).emit("pending-order-canceling-confirmation-to-checkout", orderId);
    });
  });
};
