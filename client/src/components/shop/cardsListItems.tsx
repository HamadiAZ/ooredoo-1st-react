import React from "react";
import { MdPadding } from "react-icons/md";
import { singleProductObjectType } from "../../types/types";
export default function CardsListItems(
  {
    productsArray,
    handleAddToCard,
  }: {
    productsArray: singleProductObjectType[];
    handleAddToCard: (item: singleProductObjectType) => void;
  },
  ulId: string
) {
  return (
    <>
      {productsArray.map((item: singleProductObjectType) => {
        return (
          <li key={item.id} className="list-items-final-class">
            <img
              alt="store"
              src={
                "https://hbr.org/resources/images/article_assets/2019/11/Nov19_14_sb10067951dd-001.jpg"
              }
            />
            <div className="li-button-and-name-container">
              <p style={{ fontSize: "1.2rem", padding: "" }}>{item.name}</p>
              <p style={{ fontSize: "1rem", padding: "0", margin: "0" }}>
                {"price : " + item.price + " DT"}
              </p>
              <p
                className="btn buy"
                style={{ width: "fit-content", padding: "0 1rem" }}
                onClick={() => handleAddToCard(item)}
              >
                Add to card
              </p>
            </div>
          </li>
        );
      })}
    </>
  );
}
