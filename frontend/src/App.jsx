import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import RiderDashboard from "./pages/dashboard/RiderDashboard";
import HelperDashboard from "./pages/dashboard/HelperDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard/rider"
          element={<RiderDashboard />}
        />

        <Route
          path="/dashboard/helper"
          element={<HelperDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;