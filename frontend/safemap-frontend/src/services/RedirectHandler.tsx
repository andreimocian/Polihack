import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    if (role === "authority") navigate("/authority");
    else navigate("/citizen");
  }, []);

  return <p>Loading...</p>;
}
