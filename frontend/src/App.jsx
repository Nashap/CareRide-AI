import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SmoothScroll from "./components/common/SmoothScroll";
import LoadingScreen from "./components/common/LoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

const RiderDashboard = React.lazy(() => import("./pages/dashboard/RiderDashboard"));
const HelperDashboard = React.lazy(() => import("./pages/dashboard/HelperDashboard"));
const AssignedRides = React.lazy(() => import("./pages/helper/AssignedRides"));
const BrowseRequests = React.lazy(() => import("./pages/helper/BrowseRequests"));
const Availability = React.lazy(() => import("./pages/helper/Availability"));
const BookRide = React.lazy(() => import("./pages/bookings/BookRide"));
const MyRides = React.lazy(() => import("./pages/bookings/MyRides"));

const AIRecommendation = React.lazy(() => import("./pages/helper/AIRecommendation"));
const Helpers = React.lazy(() => import("./pages/helpers/Helpers"));
const AIAssistant = React.lazy(() => import("./pages/ai/AIAssistant"));
const Profile = React.lazy(() => import("./pages/profile/Profile"));

// Fallback loader while lazy loading chunks
const Fallback = () => <LoadingScreen />;

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard/rider" element={<ProtectedRoute><RiderDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/helper" element={<ProtectedRoute><HelperDashboard /></ProtectedRoute>} />
            <Route path="/helper/assigned-rides" element={<ProtectedRoute><AssignedRides /></ProtectedRoute>} />
            <Route path="/helper/browse-requests" element={<ProtectedRoute><BrowseRequests /></ProtectedRoute>} />
            <Route path="/helper/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
            <Route path="/book-ride" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
            <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
            <Route path="/ai-recommendation/:travelRequestId" element={<ProtectedRoute><AIRecommendation /></ProtectedRoute>} />
            <Route path="/helpers" element={<ProtectedRoute><Helpers /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
          </Routes>
        </Suspense>
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;
