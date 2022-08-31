export type StoreObjectJSONType = {
  id: number;
  name: string;
  shops: number | null;
  img: string;
};
export type onlineAdminType = [string, number];
export type pendingOrdersType = [number, string, number];
export type shopPendingOrder = {
  id: string;
  shopId: number;
  clientId: number;
  data: orderToDb;
  sendTimeInSeconds: number;
};

export type addShopInputType = {
  name: string;
  address: string;
  store: number;
  long: number;
  lat: number;
  surplace: boolean;
  delivery: boolean;
  export: boolean;
  cash: boolean;
  cc: boolean;
  check: boolean;
  voucher: boolean;
};

export type ShopObjectFromDbType = {
  id: number;
  store_id: number;
  name: string;
  address: { address: string; lat: number; long: number };
  mdv: {
    surplace: boolean;
    delivery: boolean;
    export: boolean;
  };
  mdp: {
    cash: boolean;
    check: boolean;
    voucher: boolean;
    cc: boolean;
  };
  schedule: fullScheduleGroupType[];
};

export type fullScheduleGroupType = {
  id: number;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    san: boolean;
  };
  schedule: scheduleObjectType[];
  formCheck: boolean;
};

export type scheduleObjectType = {
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  index: number;
  fulltime: boolean;
  currentOrNextOne: boolean;
};

export type orderToDb = {
  shopId: number;
  userId: number;
  userName: string;
  mdp: string;
  mdv: string;
  deliveryTime: string;
  deliveryAddr: string;
  status: string;
  content: orderContentType[];
};

export type orderFromDb = {
  order_id: number;
  shop_id: number;
  user_id: number;
  user_name: string;
  mdp: string;
  mdv: string;
  created_at: string;
  delivery_addr: string;
  delivery_time: string;
  status: string;
  content: orderContentType[];
};

export type orderFromDbJsFormat = {
  orderId: number;
  shopId: number;
  userId: number;
  userName: string;
  mdp: string;
  mdv: string;
  deliveryTime: string;
  deliveryAddr: string;
  status: string;
  content: orderContentType[];
};

export type orderContentType = {
  product_id: number;
  name: string;
  category: string;
  manufacture: string;
  price: number;
  quantity: number;
  quantityLeft: number;
  shopId: number;
  status: string;
};

export type loggedInStateType = {
  id: number;
  isLoggedIn: boolean;
  privilege: string;
  name: string;
  username: string;
};
