import { useState, useEffect, useRef } from "react";

import SearchBox from "../searchBox";
import GroupsOfSchedule from "./groupsOfSchedule";

import {
  ShopObjectType,
  fullScheduleGroupType,
  StoreObjectJSONType,
  addShopInputType,
} from "../../types/types";

const arrayInit: fullScheduleGroupType[] = [
  {
    id: 0,
    days: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      san: false,
    },
    schedule: [
      {
        startH: 8,
        startM: 0,
        endH: 16,
        endM: 0,
        index: 0,
        fulltime: false,
        currentOrNextOne: false,
      },
    ],
    formCheck: true,
  },
];

const inputInit: addShopInputType = {
  name: "kebeli",
  address: "rue meed ali",
  store: 1,
  long: 8,
  lat: 22,
  surplace: false,
  delivery: false,
  export: false,
  cash: false,
  cc: false,
  check: false,
  voucher: false,
};

export default function AddShop(props: any) {
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  //states
  const [suggestionState, setSuggestionState] = useState<boolean>(false);
  const [suggestionDataArray, setSuggestionDataArray] = useState<any[]>([]);
  const [stores, setStores] = useState<StoreObjectJSONType[]>([]);

  const [fullSchedule, setFullSchedule] = useState<fullScheduleGroupType[]>(arrayInit);

  const [input, setInput] = useState(inputInit);

  function handleInputChange(event: any): void {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    setInput((prev) => {
      return { ...prev, [name]: value };
    });
  }
  function checkScheduleOnSubmit(): boolean {
    for (let group of fullSchedule) {
      if (!group.formCheck) {
        console.log("invalid form here");
        return false;
      }
    }
    console.log("forme is fine");
    return true;
  }
  function checkForm(): boolean {
    if (
      input.name.trim().length < 2 ||
      input.address.trim().length < 5 ||
      !input.lat ||
      !input.long ||
      !checkScheduleOnSubmit()
    ) {
      return false;
    }
    return true;
  }
  async function handleSubmit(event: any): Promise<void> {
    event.preventDefault();
    let jsonObjectToSend: ShopObjectType = {
      id: 0,
      store_id: input.store,
      name: input.name,
      address: { address: input.address, lat: input.lat, long: input.long },
      mdv: {
        surplace: input.surplace,
        delivery: input.delivery,
        export: input.export,
      },
      mdp: {
        cash: input.cash,
        check: input.check,
        voucher: input.voucher,
        cc: input.cc,
      },
      schedule: fullSchedule,
    };

    console.dir(confirmationRef.current);
    if (checkForm()) {
      try {
        const res = await fetch(props.globalPath + "/api/admin/addShop", {
          method: "POST",
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jsonObjectToSend),
        });

        if (confirmationRef.current != undefined) {
          confirmationRef.current.innerText = "Shop added !";
          confirmationRef.current.className = "form-confirmation-done";
        }
      } catch (error) {}
    } else {
      if (confirmationRef.current != undefined) {
        confirmationRef.current.innerText = "Invalid form !";
        confirmationRef.current.className = "form-confirmation-error";
      }
    }
  }

  useEffect(() => {
    getListStore();
  }, []);

  async function getListStore() {
    let res = await fetch(props.globalPath + "/api/getStores");
    let data = await res.json();
    setStores(data);
  }

  async function handleSearchClick() {
    const res = await fetch(
      `http://api.positionstack.com/v1/forward?access_key=a18d5f41712ab974a5fb1382721fd92b&query=${input.address}`
    );
    const mapPage = await res.json();
    console.log(mapPage.data);
    setSuggestionState(true);
    setSuggestionDataArray(mapPage.data);
  }

  function handleItemClick(item: any) {
    setSuggestionState(false);
    setInput((prev) => {
      return {
        ...prev,
        address: item.label,
        lat: item.latitude,
        long: item.longitude,
      };
    });
  }

  function handleAddScheduleGroup() {
    const newGroup: fullScheduleGroupType = {
      id: fullSchedule.length,
      days: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        san: false,
      },
      schedule: [
        {
          startH: 8,
          startM: 0,
          endH: 14,
          endM: 0,
          index: 0,
          fulltime: false,
          currentOrNextOne: false,
        },
      ],
      formCheck: false,
    };
    setFullSchedule((prev): fullScheduleGroupType[] => {
      return [...prev, newGroup];
    });
  }

  function handleDeleteGroup(group_id: number): void {
    setFullSchedule((prev): fullScheduleGroupType[] =>
      prev.filter((group) => group.id !== group_id)
    );
  }

  // return *****************************************

  return (
    <main id="add-shop-main">
      <h1>add shop to store</h1>
      <form
        id="add-admin-form"
        onClick={() => {
          setSuggestionState(false);
        }}
      >
        <label>Nom de shop :</label>
        <input
          name="name"
          type="text"
          className={input.name.trim().length < 2 ? "input-fields-error" : "input-fields"}
          value={input.name}
          onChange={handleInputChange}
        />

        <label>Address :</label>

        <SearchBox
          input={input}
          handleInputChange={handleInputChange}
          handleSearchClick={handleSearchClick}
          suggestionState={suggestionState}
          suggestionDataArray={suggestionDataArray}
          handleItemClick={handleItemClick}
        />
        <label>Location long:lat</label>
        <div style={{ display: "flex" }}>
          <input
            className={input.long ? "input-fields" : "input-fields-error"}
            name="long"
            type="number"
            value={input.long}
            onChange={handleInputChange}
          />
          <input
            className={input.lat ? "input-fields" : "input-fields-error"}
            name="lat"
            type="number"
            value={input.lat}
            onChange={handleInputChange}
          />
        </div>
        <p> horaire</p>
        <div id="add-shop-schedule--root-container">
          {fullSchedule.map((item) => {
            return (
              <GroupsOfSchedule
                key={item.id}
                setFullSchedule={setFullSchedule}
                data={item}
                handleAddScheduleGroup={handleAddScheduleGroup}
                handleDeleteGroup={handleDeleteGroup}
              />
            );
          })}
        </div>
        <p>Select</p>
        <select name="store" value={input.store} onChange={handleInputChange}>
          {stores.map((item) => {
            return (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            );
          })}
        </select>

        <label>MDV :</label>
        <div id="add-shop--mdv-div">
          <div className="checkbox-divs">
            <span> Surplace:</span>
            <input
              className="input-fields"
              name="surplace"
              type="checkbox"
              checked={input.surplace}
              onChange={handleInputChange}
            />
          </div>
          <div className="checkbox-divs">
            <span> Livraison:</span>
            <input
              className="input-fields"
              name="delivery"
              type="checkbox"
              checked={input.delivery}
              onChange={handleInputChange}
            />
          </div>
          <div className="checkbox-divs">
            <span> Exporter:</span>
            <input
              className="input-fields"
              name="export"
              type="checkbox"
              checked={input.export}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <label>MDP :</label>
        <div id="add-shop--mdv-div">
          <div className="checkbox-divs">
            <span> Cash:</span>
            <input name="cash" type="checkbox" checked={input.cash} onChange={handleInputChange} />
          </div>
          <div className="checkbox-divs">
            <span> Credit card:</span>
            <input name="cc" type="checkbox" checked={input.cc} onChange={handleInputChange} />
          </div>
          <div className="checkbox-divs">
            <span> Tickets :</span>
            <input
              name="voucher"
              type="checkbox"
              checked={input.voucher}
              onChange={handleInputChange}
            />
          </div>
          <div className="checkbox-divs">
            <span> Cheque :</span>
            <input
              name="check"
              type="checkbox"
              checked={input.check}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <input
          id="submit"
          type="submit"
          value="Submit"
          onClick={(event): void => {
            handleSubmit(event);
          }}
        />
      </form>

      <p ref={confirmationRef}></p>
    </main>
  );
}
