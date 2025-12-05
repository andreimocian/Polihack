import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px" }}>
      <Link to="/">Home</Link>
      <Link to="/citizen">Citizen</Link>
      <Link to="/authority">Authority</Link>
      <Link to="/map">Map</Link>
    </nav>
  );
};

export default Navbar;
