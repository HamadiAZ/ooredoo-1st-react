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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const uuid_1 = require("uuid");
//parameters
const acceptOrderIfNoOnlineAdmin = true;
// variables
let onlineAdmins = [];
// [   [ADMINsocketID,ShopID] , [ADMINsocketID,ShopID] ...]
let clientsWithPendingOrders = [];
// [   [clientId,orderId,shopId] , [clientId,orderID,shopId] ...]
let pendingOrders = {};
/* structure will be {
     shopId : [pending orders array],
    
    with every order of array :
    {
      id:string
      shopId:number
      clientId:string
      data: order db Body}
    }

  } */
module.exports = function (io) {
    return __awaiter(this, void 0, void 0, function* () {
        io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            socket.on("disconnect", function () {
                // if its admin : delete it from the onlineAdmins
                let userType = "user";
                onlineAdmins = onlineAdmins.filter((onlineAdmin) => {
                    if (onlineAdmin[0] === socket.id)
                        userType = "admin";
                    return onlineAdmin[0] != socket.id;
                });
                //if its client : same
                clientsWithPendingOrders = clientsWithPendingOrders.filter((clientOnline) => {
                    // [clientId,orderId,shopId]
                    if (clientOnline[0] === socket.id) {
                        // client found
                        const shopId = clientOnline[2];
                        const orderId = clientOnline[1];
                        userType = "client";
                        onlineAdmins.forEach((adminInfo) => {
                            // broadcast to every connected admin of the shop
                            if (shopId == adminInfo[1]) {
                                socket.to(adminInfo[0]).emit("cancel-pending-order-admin", orderId);
                            }
                        });
                    }
                    return clientOnline[0] != socket.id; // the actual filtering
                });
                console.log(`disconnected ${userType} id :`, socket.id);
            });
            socket.on("shop-admin-is-online", (shopId) => __awaiter(this, void 0, void 0, function* () {
                // setting online admins array
                onlineAdmins = onlineAdmins.filter((admin) => admin[0] != socket.id);
                onlineAdmins.push([socket.id, shopId]);
                console.log("connected admins array :", onlineAdmins);
                const pendingShopOrders = yield getPendingOrdersForShopFromDb(shopId);
                //admin connected : send him the pending orders of the shop
                socket.emit("here-are-your-pending-orders-admin", pendingShopOrders);
            }));
            socket.on("from-client--req-admins-array", (shopId) => {
                //response of admins availability
                // if front i will check if onlineAdmins of this shop=[] then no admin is online
                const onlineAdminsOfRequestedShop = onlineAdmins.filter((item) => item[1] == shopId);
                console.log("requested admins array", onlineAdminsOfRequestedShop);
                socket.emit("admins-availability", onlineAdminsOfRequestedShop, acceptOrderIfNoOnlineAdmin);
            });
            socket.on("checkout-prompt-from-client", (data) => {
                const { shopId } = data;
                const orderId = (0, uuid_1.v4)();
                const con = !isShopAdminOnline(shopId) && acceptOrderIfNoOnlineAdmin;
                if (con) {
                    addOrderToPendingOrders(orderId, shopId, socket.id, data);
                }
                console.log(pendingOrders);
                clientsWithPendingOrders.push([socket.id, orderId, shopId]);
                // send to online admins of this the same shop
                onlineAdmins.forEach((adminInfo) => {
                    if (shopId == adminInfo[1])
                        socket
                            .to(adminInfo[0])
                            .emit("new-order-to-shop-admins", adminInfo[0], socket.id, data, orderId, acceptOrderIfNoOnlineAdmin);
                });
                //send order id back to client
                socket.emit("order-id-for-client", orderId);
            });
            socket.on("order-confirmation", (isConfirmed, clientId, orderId, shopId) => {
                socket.to(clientId).emit("order-confirmation-to-user", isConfirmed);
                const con = !isShopAdminOnline(shopId) && acceptOrderIfNoOnlineAdmin;
                if (con) {
                    deletePendingOrder(shopId, orderId); // finished
                }
            });
            socket.on("from-client--cancel-order-after-sent", (orderId, shopId) => {
                console.log("cancel : ", orderId);
                const con = !isShopAdminOnline(shopId) && acceptOrderIfNoOnlineAdmin;
                if (con) {
                    deletePendingOrder(shopId, orderId); // finished
                }
                onlineAdmins.forEach((adminInfo) => {
                    if (shopId == adminInfo[1])
                        socket.to(adminInfo[0]).emit("cancel-pending-order-admin", orderId, socket.id);
                });
            });
            socket.on("pending-order-canceling-confirmation", (orderId, clientId) => {
                socket.to(clientId).emit("pending-order-canceling-confirmation-to-checkout", orderId);
            });
        }));
    });
};
function isShopAdminOnline(shopId) {
    let isOnline = false;
    onlineAdmins.forEach((item) => {
        if (item[1] == shopId)
            isOnline = true;
    });
    return isOnline;
}
function addOrderToPendingOrders(orderId, shopId, clientId, data) {
    var _a;
    const newOrder = {
        id: orderId,
        shopId,
        clientId,
        data,
    };
    if (((_a = pendingOrders[shopId]) === null || _a === void 0 ? void 0 : _a.length) >= 0) {
        // here i will push  : array of shop already defined
        pendingOrders[shopId].push(newOrder);
    }
    else {
        // here i will affect cuz not defined
        pendingOrders[shopId] = [newOrder];
    }
}
function getPendingOrdersForShopFromDb(shopId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield db_1.pool.query(`select * from orders where "shop_id"='${shopId}' AND "status"='pending confirmation'`);
            const rows = data.rows;
            return rows;
        }
        catch (error) {
            console.error(error.message);
        }
    });
}
function deletePendingOrder(shopId, orderId) {
    var _a;
    if (((_a = pendingOrders[shopId]) === null || _a === void 0 ? void 0 : _a.length) >= 0) {
        pendingOrders[shopId] = pendingOrders[shopId].filter((order) => order.id != orderId);
    }
    else {
        console.log("something went wrong, order already deleted ??");
    }
}
/* function getPendingOrdersForShop(shopId) {
  if (pendingOrders[shopId]?.length >= 0) {
    //  array of shop orders already defined
    return pendingOrders[shopId];
  } else {
    // undefined
    return [];
  }
} */
