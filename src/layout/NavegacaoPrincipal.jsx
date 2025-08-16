import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const abas = [
  { to: "/inicio",       label: "Início" },
  { to: "/animais",      label: "Animais" },
  { to: "/leite",        label: "Leite" },
  { to: "/reproducao",   label: "Reprodução" },
  { to: "/bezerras",     label: "Bezerras" },
  { to: "/financeiro",   label: "Financeiro" },
  { to: "/ajustes",      label: "Ajustes" },
  { to: "/admin",        label: "Admin" },
];

export default function NavegacaoPrincipal() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.log("[NAV] NavegacaoPrincipal montou");
  }, []);

  // lembrar última aba acessada
  useEffect(() => {
    localStorage.setItem("ultimaAba", pathname);
  }, [pathname]);

  // se abrir em "/", manda para última aba (ou /inicio)
  useEffect(() => {
    if (pathname === "/") {
      const ultima = localStorage.getItem("ultimaAba") || "/inicio";
      navigate(ultima, { replace: true });
    }
  }, [pathname, navigate]);

  return (
    <nav className="max-w-7xl mx-auto px-4">
      <div className="flex gap-2 overflow-x-auto py-3">
        {abas.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "px-3 py-2 rounded-xl whitespace-nowrap transition-all " +
              (isActive
                ? "bg-white text-[#173d8f] shadow"
                : "text-white/90 hover:text-white hover:bg-white/10")
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
