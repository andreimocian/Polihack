import { fetchCurrentUser } from "../services/loginService";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return user;
}

export default function Home() {
  const user = useCurrentUser();

  const roleMessage =
  user?.role === "autoritate"
    ? "Rolul tău: autoritate — gestionezi rapoartele și coordonezi intervențiile."
    : user?.role === "voluntar"
    ? "Rolul tău: voluntar — ajuți la evaluarea situațiilor și sprijini echipele din teren."
    : null;


  return (
    <div style={{ padding: 16 }}>
      <h1>SafeMap</h1>
      {user && (
        <>
          <p>Bine ai venit, {user.name}!</p>
          {roleMessage && <p style={{ opacity: 0.8 }}>{roleMessage}</p>}
        </>
      )}
      
      {/* <p>Real-time disaster lifeline web app</p>
      <div style={{ display: "flex", gap: 8 }}>
        <Link to="/citizen"><button>Citizen</button></Link>
        <Link to="/authority"><button>Authority</button></Link>
        <Link to="/map"><button>Open Map</button></Link>
      </div> */}
    </div>
  );
}
