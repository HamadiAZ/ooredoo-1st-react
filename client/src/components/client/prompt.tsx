import React, { Dispatch } from "react";

export default function Prompt({
  promptState,
  setPromptState,
}: {
  promptState: any;
  setPromptState: any;
}) {
  function closePrompt(): void {
    setPromptState((prev: any) => {
      return {
        ...prev,
        show: false,
      };
    });
  }
  console.log(promptState.order);
  return (
    <div id="prompt-root-container" onClick={closePrompt}>
      <div id="admin-order-prompt-content-container" onClick={(event) => event.stopPropagation()}>
        <main id="prompt-main-root-container">
          {promptState?.order?.content?.length > 0 ? (
            <table>
              <thead>
                <tr style={{ fontWeight: "bold" }}>
                  <td>name</td>
                  <td>category</td>
                  <td style={{ width: "8rem" }}>marque</td>
                  <td>quantity</td>
                  <td>price</td>
                  <td>total</td>
                </tr>
              </thead>
              <tbody>
                {promptState?.order?.content?.map((item: any) => {
                  return (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.manufacture}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td style={{ fontWeight: "bold" }}>{item.quantity * item.price}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: "bold" }}>
                  <td></td>
                  <td></td>
                  <td>TOTAL </td>
                  <td>
                    {promptState.order.content.reduce(
                      (accumulator: number, value: any) =>
                        accumulator + value.quantity * value.price,
                      0
                    )}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p>error</p>
          )}
        </main>
        <div className="btn btn-small" onClick={closePrompt} style={{ marginBottom: "1rem" }}>
          Close
        </div>
      </div>
    </div>
  );
}
