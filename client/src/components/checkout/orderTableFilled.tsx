import React from "react";
import { MdDelete } from "react-icons/md";
import { JsxChild } from "typescript";
import { basketProductType, scheduleCheckoutObjectType, Selector } from "../../types/types";

export default function ({
  shoppingBasket,
  setShoppingBasket,
  dispatch,
  newSelectorArray,
  state,
  shopData,
  basketCounter,
  handleOrder,
}: any): JSX.Element {
  function handleQuantityChange(
    event: React.ChangeEvent<HTMLInputElement>,
    item: basketProductType
  ): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      for (const product of newArray) {
        if (product.name === item.name) {
          product.quantity = parseInt(event.target.value);
        }
      }
      return newArray;
    });
  }

  function handleDeleteItem(item: basketProductType): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      newArray = newArray.filter((product) => item.name !== product.name);
      return newArray;
    });
  }

  function handleAddressInput(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch({ type: Selector.addr, payload: event.target.value });
  }

  function handleInputTimeSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.time, payload: event.target.value });
  }
  function handleInputMdvSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.mdv, payload: event.target.value });
  }
  function handleInputMdpSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.mdp, payload: event.target.value });
  }

  return (
    <table>
      <thead>
        <tr style={{ fontWeight: "bold" }}>
          <td>name</td>
          <td>category</td>
          <td style={{ width: "8rem" }}>marque</td>
          <td>quantity</td>
          <td>price</td>
          <td>total</td>
          <td>delete</td>
        </tr>
      </thead>
      <tbody>
        {shoppingBasket.map((item: basketProductType) => {
          return (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.manufacture}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(event) => handleQuantityChange(event, item)}
                ></input>
              </td>
              <td>{item.price}</td>
              <td style={{ fontWeight: "bold" }}>{item.quantity * item.price}</td>
              <td>
                <MdDelete onClick={() => handleDeleteItem(item)} className="basket-delete-icon" />
              </td>
            </tr>
          );
        })}
        <tr>
          <td>
            <hr />
          </td>
          <td>
            <hr />
          </td>
          <td>
            <hr />
          </td>
          <td>
            <hr />
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr style={{ fontWeight: "bold" }}>
          <td></td>
          <td></td>
          <td>TOTAL </td>
          <td>
            {shoppingBasket.reduce(
              (accumulator: number, value: basketProductType) =>
                accumulator + value.quantity * value.price,
              0
            )}
          </td>
          <td>
            <p>select picking time :</p>
          </td>
          <td>
            <select name="select" value={state[Selector.time]} onChange={handleInputTimeSelector}>
              {newSelectorArray.map((item: scheduleCheckoutObjectType) => {
                return (
                  <option
                    key={item.hours + ":" + item.minutes}
                    value={item.hours + ":" + item.minutes}
                  >
                    {item.day + " | " + item.hours + ":" + item.minutes}
                  </option>
                );
              })}
            </select>
          </td>
        </tr>
        <tr style={{ fontWeight: "bold" }}>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <p>select payment method :</p>
          </td>
          <td>
            <select name="select" value={state[Selector.mdp]} onChange={handleInputMdpSelector}>
              {Object.keys(shopData.mdp).map((item: string) => {
                if (shopData.mdp[item as keyof typeof shopData.mdp] === true) {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                }
              })}
            </select>
          </td>
        </tr>
        <tr style={{ fontWeight: "bold" }}>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <p>select picking method :</p>
          </td>
          <td>
            <select name="select" value={state[Selector.mdv]} onChange={handleInputMdvSelector}>
              {Object.keys(shopData.mdv).map((item: string) => {
                if (shopData.mdv[item as keyof typeof shopData.mdv] === true) {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                }
              })}
            </select>
          </td>
        </tr>
        {state.inputMdvSelector == "delivery" && (
          <tr style={{ fontWeight: "bold" }}>
            <td></td>
            <td></td>
            <td>
              <p>write your address :</p>
            </td>
            <td colSpan={3}>
              <input
                id="checkout-delivery-address-input"
                name="input"
                value={state[Selector.addr]}
                onChange={handleAddressInput}
              ></input>
            </td>
            <td></td>
          </tr>
        )}

        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            {basketCounter > 0 ? (
              <div className="btn btn-small buy" onClick={handleOrder}>
                Order
              </div>
            ) : (
              <div className="btn btn-small warning">Checkout</div>
            )}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
