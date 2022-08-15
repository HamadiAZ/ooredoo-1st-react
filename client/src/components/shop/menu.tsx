import { menuObjectType, singleProductObjectType } from "../../types/types";
import SubMenu from "./subMenu";

export default function Menu({
  MenusArray,
  handleAddToCard,
}: {
  MenusArray: menuObjectType[];
  handleAddToCard: (item: singleProductObjectType) => void;
}): JSX.Element {
  //console.log(MenusArray);
  return (
    <ul
      key={MenusArray[0].signification}
      className="containers-of-li-items"
      id="1"
      style={{ gap: "1rem" }}
    >
      {MenusArray.map((item: menuObjectType) => {
        return (
          <SubMenu
            key={item.signification}
            subMenusArray={item.subMenus /*a modifier*/}
            handleAddToCard={handleAddToCard}
          />
        );
      })}
    </ul>
  );
}
