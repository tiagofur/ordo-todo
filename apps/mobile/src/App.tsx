import { Navigate, Route, Routes } from "react-router-dom";
import Spike from "./pages/Spike";

/**
 * Shell del spike: enruta al validador. Las fases P1+ sustituyen estas
 * rutas por las reales (login, today, timer, notas…).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/spike" replace />} />
      <Route path="/spike" element={<Spike />} />
      <Route
        path="/login"
        element={
          <div className="p-6 text-sm text-zinc-400">
            Login (fase P1 — placeholder del spike)
          </div>
        }
      />
      <Route
        path="/today"
        element={
          <div className="p-6 text-sm text-zinc-400">
            Hoy (fase P2 — placeholder del spike)
          </div>
        }
      />
      <Route
        path="*"
        element={<div className="p-6 text-sm text-zinc-400">404</div>}
      />
    </Routes>
  );
}
