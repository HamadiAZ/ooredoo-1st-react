export type StoreObjectJSONType = {
  id: number;
  name: string;
  shops: number | null;
  img: string;
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
