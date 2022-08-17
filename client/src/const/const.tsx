import { daysOfWeekType, ProductsDataArrayType } from "../types/types";

export const daysOfWeek: daysOfWeekType = {
  0: "san",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export const products: ProductsDataArrayType = [
  {
    category: "phones",
    subMenus: [
      {
        manufacture: "samsung",
        products: [
          { id: 1, name: "s12", quantity: 52, type: "product", price: 1000 },
          { id: 2, name: "s13", quantity: 12, type: "product", price: 1200 },
          { id: 3, name: "s14", quantity: 14, type: "product", price: 1300 },
          { id: 4, name: "s15", quantity: 17, type: "product", price: 1500 },
          { id: 5, name: "s16", quantity: 5, type: "product", price: 1900 },
        ],
        type: "subMenu",
      },
      {
        manufacture: "apple",
        products: [
          {
            id: 1,
            name: "iphone 2",
            quantity: 52,
            type: "product",
            price: 600,
          },
          {
            id: 2,
            name: "iphone 3",
            quantity: 12,
            type: "product",
            price: 1000,
          },
          {
            id: 3,
            name: "iphone 4",
            quantity: 14,
            type: "product",
            price: 1200,
          },
          {
            id: 4,
            name: "iphone 5",
            quantity: 17,
            type: "product",
            price: 1800,
          },
        ],
        type: "subMenu",
      },
      {
        manufacture: "Oppo",
        products: [
          { id: 1, name: "oppo 2", quantity: 52, type: "product", price: 600 },
          { id: 2, name: "oppo 3", quantity: 12, type: "product", price: 750 },
          { id: 3, name: "oppo 4", quantity: 14, type: "product", price: 800 },
          { id: 4, name: "oppo 5", quantity: 17, type: "product", price: 1000 },
        ],
        type: "subMenu",
      },
      {
        manufacture: "mi",
        products: [
          {
            id: 1,
            name: "Xiaomi 2",
            quantity: 52,
            type: "product",
            price: 100,
          },
          {
            id: 2,
            name: "Xiaomi 3",
            quantity: 12,
            type: "product",
            price: 300,
          },
          {
            id: 3,
            name: "Xiaomi 4",
            quantity: 14,
            type: "product",
            price: 500,
          },
          {
            id: 4,
            name: "Xiaomi 5",
            quantity: 17,
            type: "product",
            price: 700,
          },
        ],
        type: "subMenu",
      },
    ],
    type: "menu",
  },
  {
    category: "sims",
    subMenus: [
      {
        manufacture: "dataSim",
        products: [
          { id: 1, name: "20gb", quantity: 52, type: "product", price: 17 },
          { id: 2, name: "50gb", quantity: 12, type: "product", price: 30 },
          { id: 3, name: "10gb", quantity: 14, type: "product", price: 10 },
        ],
        type: "subMenu",
      },
      {
        manufacture: "normalSim",
        products: [
          {
            id: 1,
            name: "normalSim 2",
            quantity: 52,
            type: "product",
            price: 10,
          },
          {
            id: 2,
            name: "normalSim 3",
            quantity: 12,
            type: "product",
            price: 10,
          },
          {
            id: 3,
            name: "normalSim 4",
            quantity: 14,
            type: "product",
            price: 5,
          },
          {
            id: 4,
            name: "normalSim 5",
            quantity: 17,
            type: "product",
            price: 2,
          },
        ],
        type: "subMenu",
      },
      {
        manufacture: "businessSim",
        products: [
          {
            id: 1,
            name: "busiSim 2",
            quantity: 52,
            type: "product",
            price: 10,
          },
          {
            id: 2,
            name: "busiSim 3",
            quantity: 12,
            type: "product",
            price: 20,
          },
          {
            id: 3,
            name: "busiSim 4",
            quantity: 14,
            type: "product",
            price: 20,
          },
          {
            id: 4,
            name: "busiSim 5",
            quantity: 17,
            type: "product",
            price: 22,
          },
        ],
        type: "subMenu",
      },
    ],
    type: "menu",
  },
  {
    category: "bluetooth devices",
    subMenus: [
      {
        manufacture: "junk",
        products: [
          { id: 1, name: "junk 1", quantity: 52, type: "product", price: 20 },
          { id: 2, name: "junk 2", quantity: 12, type: "product", price: 40 },
        ],
        type: "subMenu",
      },
      {
        manufacture: "nokia",
        products: [
          { id: 1, name: "nokia 2", quantity: 52, type: "product", price: 40 },
          { id: 2, name: "nokia 3", quantity: 12, type: "product", price: 25 },
          { id: 3, name: "nokia 4", quantity: 14, type: "product", price: 30 },
          { id: 4, name: "nokia 5 ", quantity: 17, type: "product", price: 70 },
        ],
        type: "subMenu",
      },
      {
        manufacture: "hyperX",
        products: [
          { id: 1, name: "hyperX 2", quantity: 52, type: "product", price: 10 },
          { id: 2, name: "hyperX 3", quantity: 12, type: "product", price: 12 },
          { id: 3, name: "hyperX 4", quantity: 14, type: "product", price: 20 },
          { id: 4, name: "hyperX 5", quantity: 17, type: "product", price: 17 },
        ],
        type: "subMenu",
      },
    ],
    type: "menu",
  },
];
