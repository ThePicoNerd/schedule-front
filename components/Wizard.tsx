import React, { FunctionComponent, useContext, useState } from "react";
import { Formik, Form, Field } from "formik";
import ScheduleSelector from "../components/ScheduleSelector";
import { Context } from "./context";
import Login from "./Login";

const Wizard: FunctionComponent = () => {
  const { token } = useContext(Context);
  const authenticated = !!token;

  if (authenticated) {
    return <ScheduleSelector />;
  }

  return <Login />;
};

export default Wizard;
