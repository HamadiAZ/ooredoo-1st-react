import { menuObjectType, singleProductObjectType } from "../../types/types";
import SubMenu from "./subMenu";
import CategoriesListItem from "./categoriesListItem";

export default function Menu({
  MenusArray,
  handleAddToCard,
  selectedMenu,
  handleNavigatorClick,
}: {
  MenusArray: menuObjectType[];
  handleAddToCard: (item: singleProductObjectType) => void;
  selectedMenu: string;
  handleNavigatorClick: (item: menuObjectType) => void;
}): JSX.Element {
  if (selectedMenu) {
    return (
      <ul
        key={MenusArray[0].category}
        className="containers-of-li-items"
        id="1"
        style={{ gap: "1rem" }}
      >
        {MenusArray.map((item: menuObjectType) => {
          return (
            <SubMenu
              key={item.category}
              subMenusArray={item.subMenus /*a modifier*/}
              handleAddToCard={handleAddToCard}
            />
          );
        })}
      </ul>
    );
  } else {
    return (
      <ul
        key={MenusArray[0].category}
        className="containers-of-li-items"
        id="1"
        style={{ gap: "1rem" }}
      >
        {
          <CategoriesListItem
            key={MenusArray[0].category}
            menuObjectsArray={MenusArray /*a modifier*/}
            handleNavigatorClick={handleNavigatorClick}
          />
        }
      </ul>
    );
  }
}
