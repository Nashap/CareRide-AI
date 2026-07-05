import { BrowserRouter, Routes, Route } from "react-router-dom";
import SmoothScroll from "./components/common/SmoothScroll";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import RiderDashboard from "./pages/dashboard/RiderDashboard";
import HelperDashboard from "./pages/dashboard/HelperDashboard";
import AssignedRides from "./pages/helper/AssignedRides";
import BrowseRequests from "./pages/helper/BrowseRequests";
import Availability from "./pages/helper/Availability";
import BookRide from "./pages/bookings/BookRide";
import MyRides from "./pages/bookings/MyRides";

import AIRecommendation from "./pages/helper/AIRecommendation";
import Helpers from "./pages/helpers/Helpers";
import AIAssistant from "./pages/ai/AIAssistant";
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
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

        <Route
          path="/helper/assigned-rides"
          element={<AssignedRides />}
        />

        <Route
          path="/helper/browse-requests"
          element={<BrowseRequests />}
        />

        <Route
          path="/helper/availability"
          element={<Availability />}
        />

        <Route
          path="/book-ride"
          element={<BookRide />}
        />

        <Route
          path="/my-rides"
          element={<MyRides />}
        />

        <Route
          path="/ai-recommendation/:travelRequestId"
          element={<AIRecommendation />}
        />

        <Route
          path="/helpers"
          element={<Helpers />}
        />

        <Route
          path="/ai"
          element={<AIAssistant />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;