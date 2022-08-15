import React from "react";
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
              <p>{item.name}</p>
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
