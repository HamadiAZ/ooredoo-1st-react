import React from "react";
import { Link } from "react-router-dom";
import { StoreObjectJSONType } from "../../types/types";

export default function Item({
  data,
}: {
  key: number;
  data: StoreObjectJSONType;
}): JSX.Element {
  return (
    <div id="home-item-root-inItem-div" style={{ objectFit: "contain" }}>
      <Link to={"/stores/" + data.id}>
        <img src={"http://localhost:5000/stores/" + data.img} />
        <div id="item-name-isopen-div">
          <p>{data.name}</p>
        </div>
      </Link>
    </div>
  );
}
