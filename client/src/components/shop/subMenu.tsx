import { subMenuObjectType, singleProductObjectType } from "../../types/types";
import CardsListItems from "./cardsListItems";

export default function SubMenu({
  subMenusArray,handleAddToCard
}: {
  subMenusArray: subMenuObjectType[];
  handleAddToCard: (item: singleProductObjectType) => void;
}): JSX.Element {
  return (
    <>
      {subMenusArray.map((item: subMenuObjectType) => {
        return (
          <CardsListItems
            key={item.manufacture}
            productsArray={item.products}
            handleAddToCard={handleAddToCard}
          />
        );
      })}
    </>
  );
}
