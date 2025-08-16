import { Outlet } from "react-router-dom";
import NavegacaoPrincipal from "./NavegacaoPrincipal";

export default function SistemaBase() {
  if (import.meta.env.DEV) console.log("[LAYOUT] SistemaBase montou");
  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <header className="bg-[#173d8f] text-white">
        <NavegacaoPrincipal />
      </header>
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
