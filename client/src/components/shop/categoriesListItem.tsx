import React from "react";
import { menuObjectType } from "../../types/types";
export default function CategoriesListItem({
  menuObjectsArray,
  handleNavigatorClick,
}: {
  menuObjectsArray: menuObjectType[];
  handleNavigatorClick: (item: menuObjectType) => void;
}) {
  return (
    <>
      {menuObjectsArray.map((item: menuObjectType) => {
        return (
          <li
            key={item.category}
            className="list-items-final-class"
            onClick={() => handleNavigatorClick(item)}
          >
            <img
              alt="category"
              src={
                "https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/Old_Electronics_hero_1.jpg"
              }
            />
            <div className="li-button-and-name-container">
              <p>{item.category}</p>
            </div>
          </li>
        );
      })}
    </>
  );
}
