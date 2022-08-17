import { basketProductType } from "../types/types";

import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
export default function Basket({
  setIsBasketShown,
  shoppingBasket,
  setShoppingBasket,
}: {
  setIsBasketShown: (arg: boolean) => void;
  shoppingBasket: basketProductType[];
  setShoppingBasket: React.Dispatch<React.SetStateAction<basketProductType[]>>;
}) {
  //const
  const basketCounter = shoppingBasket.length;

  function handleDeleteItem(item: basketProductType): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      newArray = newArray.filter((product) => item.name !== product.name);
      return newArray;
    });
  }

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

  return (
    <div id="basket-root-container">
      <div
        className="two-items-flex-space-between"
        onClick={() => setIsBasketShown(false)}
      >
        <p>Card</p>
        <p>
          {basketCounter > 1
            ? basketCounter + " items"
            : basketCounter + " item"}
        </p>
      </div>

      <hr />
      <div id="basket-table-container">
        {basketCounter > 0 ? (
          <table>
            <thead>
              <tr style={{ fontWeight: "bold" }}>
                <td>name</td>
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
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(event) => handleQuantityChange(event, item)}
                      ></input>
                    </td>
                    <td>{item.price}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {item.quantity * item.price}
                    </td>
                    <td>
                      <MdDelete
                        onClick={() => handleDeleteItem(item)}
                        className="basket-delete-icon"
                      />
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
                    (accum: number, value: basketProductType) =>
                      accum + value.quantity * value.price,
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <h1>card is empty</h1>
        )}
      </div>
      <div id="buttons-container" onClick={() => setIsBasketShown(false)}>
        <div className="btn btn-small" onClick={() => setIsBasketShown(false)}>
          Cancel
        </div>
        {basketCounter > 0 ? (
          <Link to="/checkOut">
            <div className="btn btn-small buy">Checkout</div>
          </Link>
        ) : (
          <div className="btn btn-small buy">Checkout</div>
        )}
      </div>
    </div>
  );
}
