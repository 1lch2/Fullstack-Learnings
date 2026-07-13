// Task 1
// Your task is to implement a React component that renders a text input field with auto-completion.

// Requirements
// In order to fetch items based on the current query, you should send a GET request to the mocked https://example.com/api/items endpoint. The endpoint requires a query parameter q that is meant to hold the query's value. The endpoint will fail if the q query parameter is not provided.

// The component should render a div element that has the class name wrapper and two child elements:

// A div element with the class name control.

// A div element with the class name list.

// The div element with class name control should contain an input element with the class name input, and this is the input in which the user enters a query.

// Once a response comes from the API, all strings from the response should be displayed inside the div element with class name list. Each one inside a separate a element with the class name list-item. The strings should be displayed in the same order as they arrived from the API.

// You should avoid sending too many requests to the API; in particular, do not send requests on every single keypress! You are expected to properly debounce the requests. The debounce time-out should be 500 milliseconds.

// When items are being fetched, a class name is-loading should be added to the input's wrapper (the element with class name control).

// When items are being fetched, no request has been sent or the endpoint has returned zero items, the div element with class name list should not be rendered.

// The component accepts the prop onSelectItem: (item: string) => void, which should be called with an item when the user clicks on it. Clicking on an item does not have any effect apart from calling the callback.

// The component should be the default export and can be either a function component or a class component.

// Assumptions
// https://example.com is a mocked service — it can be accessed only in the Codility UI.

// The mocked endpoint https://example.com/api/items returns an array of strings. The array's length is at most 10.

// Assume that a request sent to the mocked endpoint never fails when provided a query parameter.

// The "Preview" tab will display your component. You can use it for testing purposes. In preview mode, the API is mocked up, and will always return a random valid result. Also, the preview page imports a CSS spreadsheet from Bulma (v0.7.5) to give neat styling.

// Design/styling is not assessed and will not affect your score. You should focus only on implementing the requirements.

// Use console.log and console.error for debugging purposes via your browser's developer tools.

// When using Axios you are expected to use params argument and not build the URL by hand (documentation).

// Additional Examples
// Example 1
// Consider the following sequence of actions:

// The user types "q" into the input;

// After 50 ms the user presses "u", and then again, after every 50 ms, a new character is inserted until the input value is "query";

// Only one request to the API is sent, exactly 500 ms after "y" is input;

// During this period (from pressing "y" until the response comes in), the class name is-loading is added to the input's wrapper.

// Example 2
// If the response from the API endpoint is:
// ["Italy", "Spain", "Portugal", "Macedonia"]
// then the list section is rendered as follows:

// ```html
// <div class="list">
//   <a class="list-item">Italy</a>
//   <a class="list-item">Spain</a>
//   <a class="list-item">Portugal</a>
//   <a class="list-item">Macedonia</a>
// </div>
// ```
// Available Packages / Libraries
// Node.js (v22.15.0)

// react (v18.2.0)

// classnames (v2.5.1)

// lodash (v4.17.21)

// axios (v1.6.2)

import React, { useState, useCallback, ChangeEvent } from "react";
import axios from "axios";

const ITEMS_API_URL = "http://localhost:3001/api/items";
const DEBOUNCE_DELAY = 500;
const setTimeout = window.setTimeout;
const clearTimeout = window.clearTimeout;

// the exported component can be either a function or a class
const debounce = (fn: Function, timeout: number) => {
  let timer: number | undefined = undefined;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
};

export interface AutocompleteProps {
  onSelectItem: (val: string) => void;
}

export default function Autocomplete({ onSelectItem }: AutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [inputVal, setInputVal] = useState("");

  const inputControlCls = `control ${isLoading ? "is-loading" : ""}`;

  const fetchData = async (input: string) => {
    setIsLoading(true);
    const response = await axios({
      url: ITEMS_API_URL,
      method: "get",
      params: { q: input },
    });
    console.log(response);
    setDataList(response.data);
    setIsLoading(false);
  };

  const debouncedFetch = useCallback(debounce(fetchData, DEBOUNCE_DELAY), []);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputVal(input);
    debouncedFetch(input);
  };

  const renderlist = dataList.map((val, index) => {
    return (
      <a className="list-item" onClick={() => onSelectItem(val)} key={index}>
        {val}
      </a>
    );
  });

  return (
    <div className="wrapper">
      <div className={inputControlCls}>
        <input
          type="text"
          className="input"
          onChange={handleOnChange}
          value={inputVal}
        />
      </div>
      {!isLoading && dataList.length !== 0 && inputVal !== "" ? (
        <div className="list is-hoverable">{renderlist}</div>
      ) : null}
    </div>
  );
}
