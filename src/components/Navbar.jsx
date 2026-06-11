import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px",
        background: "#f5f5f5",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/book-ride">Book Ride</Link>
      <Link to="/my-rides">My Rides</Link>
      <Link to="/upload-certificate">Upload Certificate</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default Navbar;