import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookRide from "./pages/BookRide";
import MyRides from "./pages/MyRides";
import UploadCertificate from "./pages/UploadCertificate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book-ride" element={<BookRide />} />
        <Route path="/my-rides" element={<MyRides />} />
        <Route
          path="/upload-certificate"
          element={<UploadCertificate />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;