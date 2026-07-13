import React, { memo, createContext, useReducer, useContext } from "react";

interface ActionType {
  type: "add" | "sub" | "reset";
  payload?: number;
}

interface StateType {
  count: number;
}

const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "add": return { count: state.count + 1 };
    case "sub": return { count: state.count > 0 ? state.count - 1 : 0 };
    case "reset": return { count: action.payload ? action.payload : 0 };
  }
};

// 创建context
interface ContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>
}

const Context = createContext<ContextType | null>(null);

// ContextProvider组件
interface ContextProviderProps {
  children: React.ReactNode;
}

const ContextProvider = (props: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <Context.Provider value={{ state, dispatch }}>
      {props.children}
    </Context.Provider>
  );
};

const Show = () => {
  const { state } = useContext(Context)!;
  return (
    <div>当前数字是：{state.count}</div>
  );
};

interface UIProps {
  dispatch: React.Dispatch<ActionType>;
}

const UI = memo(
  (props: UIProps) => {
    console.log("Increase");
    return <button onClick={() => props.dispatch({ type: "add" })}> + </button>;
  }
);

const Increase = () => {
  const { dispatch } = useContext(Context)!;
  return <UI dispatch={dispatch}/>;
};

const Decrease = () => {
  console.log("Decrease");
  const { dispatch } = useContext(Context)!;
  return <button onClick={() => dispatch({ type: "sub" })}> - </button>;
};

const Reset = memo(() => {
  console.log("Reset");
  const { dispatch } = useContext(Context)!;
  const initialValue = 8;
  return <button onClick={() => dispatch({ type: "reset", payload: initialValue })}> 重置 </button>;
});

const App = () => {
  return (
    <ContextProvider>
      <Show />
      <Increase />
      <Decrease />
      <Reset />
    </ContextProvider>
  );
};

export default App;