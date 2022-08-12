import { FaSearchLocation } from "react-icons/fa";

export default function SearchBox({
  input,
  suggestionState,
  suggestionDataArray,
  handleInputChange,
  handleSearchClick,
  handleItemClick,
}: {
  input: { address: string };
  suggestionDataArray: {}[];
  suggestionState: boolean;
  handleInputChange: (event: any) => void;
  handleItemClick: (arg: any) => void;
  handleSearchClick: () => void;
}): JSX.Element {
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
