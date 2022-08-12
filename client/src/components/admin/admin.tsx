import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Prompt from "../prompt";
import "../../styles/admin.css";
export default function Admin({ globalPath }: any) {
  const [stores, setStores] = useState<any>([]);
  async function getListStore() {
    let res = await fetch(globalPath + "/getStores");
    let data = await res.json();
    setStores(data);
  }
  useEffect(() => {
    getListStore();
  }, []);
  const [prompt, setPrompt] = useState(false);
  const [selectedAction, setSelectedAction] = useState({
    item: {},
    action: "delete",
  });
  function handleAction() {}
  function handleDeleteShopClick(
    event: React.MouseEvent<HTMLDivElement>,
    item: any
  ) {
    if (event.stopPropagation) event.stopPropagation();
    setSelectedAction({ item: item, action: "delete" });
    setPrompt(true);
  }
  function handleEditShopClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.stopPropagation) event.stopPropagation();
  }
  return (
    <main id="admin-page--main-container">
      {prompt && (
        <Prompt
          action={selectedAction}
          Function={handleAction}
          setPrompt={setPrompt}
        />
      )}
      <Link to="/admin/addShop">
        <div className="btn">add Shop</div>
      </Link>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th> number of shop</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((item: any) => {
            return (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.shops}</td>
                <td>
                  <div
                    className="btn btn-small"
                    onClick={(): void => handleEditShopClick(item.id)}
                  >
                    edit
                  </div>
                </td>
                <td>
                  <div
                    className="btn btn-small warning"
                    onClick={(event): void =>
                      handleDeleteShopClick(event, item)
                    }
                  >
                    delete
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
