import React, { FunctionComponent, useContext, useState } from "react";
import { Formik } from "formik";
import { Context } from "./context";

interface Values {
  username: string;
  password: string;
}

const initialValues: Values = {
  username: "",
  password: "",
};

const Login: FunctionComponent = () => {
  const [loading, setLoading] = useState(false);
  const { setToken } = useContext(Context);

  async function handleSubmit(values: Values) {
    const { username, password } = values;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setToken(await res.text());
      } else {
        alert(`Ett fel uppstod! ${await res.text()}`);
      }
    } catch (error) {
      alert("ett okänt fel uppstod.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Var god vänta ...</p>;
  }

  return (
    <>
      <h1>Logga in</h1>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <label htmlFor="username">Användarnamn</label>
            <input
              id="username"
              name="username"
              type="text"
              onChange={formik.handleChange}
              placeholder="ab12345"
              value={formik.values.username}
            />

            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />

            <button type="submit">Logga in</button>
          </form>
        )}
      </Formik>
    </>
  );
};

export default Login;
