import React from "react";

export default function Prompt({ setPrompt, Function, action }: any) {
  //console.log(action);
  return (
    <div id="prompt-root-container" onClick={() => setPrompt(false)}>
      <div
        id="prompt-content-container"
        onClick={(event) => event.stopPropagation()}
      >
        <p>
          Delete item :<span>{action.item.name}</span>{" "}
        </p>
        <p>
          number of shops :<span>{action.item.shops}</span>{" "}
        </p>
        <div id="buttons-container">
          <div className="btn btn-small warning">DELETE</div>
          <div className="btn btn-small" onClick={() => setPrompt(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}
