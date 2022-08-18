export type StoreObjectJSONType = {
  id: number;
  name: string;
  shops: number | null;
  img: string;
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

export type imageGalleryArrayType = string[];

export type ShopObjectJSONType = {
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

export type scheduleCheckoutObjectType = {
  day: string;
  hours: number;
  minutes: number;
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

export type ScheduleOfEveryDayType = {
  mon: scheduleObjectType[];
  tue: scheduleObjectType[];
  wed: scheduleObjectType[];
  thu: scheduleObjectType[];
  fri: scheduleObjectType[];
  sat: scheduleObjectType[];
  san: scheduleObjectType[];
};

//consts :

export type daysOfWeekType = {
  0: "san";
  1: "mon";
  2: "tue";
  3: "wed";
  4: "thu";
  5: "fri";
  6: "sat";
};

export type singleProductObjectType = {
  id: number;
  name: string;
  quantity: number;
  type: "product";
  price: number;
};
export type subMenuObjectType = {
  manufacture: string;
  products: singleProductObjectType[];
  type: "subMenu";
};

export type menuObjectType = {
  category: string;
  subMenus: subMenuObjectType[];
  type: "menu";
};
export type ProductsDataArrayType = menuObjectType[];

export type basketProductType = {
  product_id: number;
  name: string;
  category: string;
  manufacture: string;
  price: number;
  quantity: number;
  quantityLeft: number;
  shopId: number;
  shopUpcomingSessions: {
    day: string;
    schedule: scheduleObjectType[];
  };
};

export type SelectorType = {
  inputTimeSelector: string;
  inputMdpSelector: string;
  inputMdvSelector: string;
  inputAddrSelector: string;
};

export enum Selector {
  time = "inputTimeSelector",
  mdp = "inputMdpSelector",
  mdv = "inputMdvSelector",
  addr = "inputAddrSelector",
}

export type orderContentType = {
  product_id: number;
  name: string;
  category: string;
  manufacture: string;
  price: number;
  quantity: number;
  quantityLeft: number;
  shopId: number;
};
export type orderToDb = {
  shopId: number;
  userId: number;
  userName: string;
  mdp: string;
  mdv: string;
  deliveryTime: string;
  deliveryAddr: string;
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
  content: orderContentType[];
};
