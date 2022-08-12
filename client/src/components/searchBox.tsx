import React from "react";
import { FaSearchLocation } from "react-icons/fa";
import { JsxElement } from "typescript";

export default function SearchBox({
  input,
  handleInputChange,
  handleSearchClick,
  suggestionState,
  suggestionDataArray,
  handleItemClick,
}: any): any {
  return (
    <div id="search-box-container">
      <input
        name="address"
        type="text"
        className={
          input.address.trim().length < 5
            ? "input-fields-error"
            : "input-fields"
        }
        value={input.address}
        onChange={handleInputChange}
      />
      <FaSearchLocation id="search-for-address" onClick={handleSearchClick} />
      <ul id="search-suggestions">
        {suggestionState &&
          suggestionDataArray.map((item: any) => (
            <li onClick={() => handleItemClick(item)}>{item.label}</li>
          ))}
      </ul>
    </div>
  );
}
