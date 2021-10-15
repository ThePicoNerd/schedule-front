import { NextPage } from "next";
import React, { useState } from "react";
import { Context } from "../components/context";
import Wizard from "../components/Wizard";

const IndexPage: NextPage = () => {
  const [token, setToken] = useState<string>();

  return (
    <Context.Provider value={{ token, setToken }}>
      <img src="/icon.png" height="200" />
      <Wizard />
      {token && <button onClick={() => setToken(undefined)}>Logga ut</button>}
    </Context.Provider>
  );
};

export default IndexPage;
