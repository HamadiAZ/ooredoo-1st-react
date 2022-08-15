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
};
export type subMenuObjectType = {
  manufacture: string;
  products: singleProductObjectType[];
  type: "subMenu";
};

export type menuObjectType = {
  signification: string;
  subMenus: subMenuObjectType[];
  type: "menu";
};
export type ProductsDataArrayType = menuObjectType[];