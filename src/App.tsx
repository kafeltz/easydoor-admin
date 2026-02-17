import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CadastrarCepPage } from "@/pages/CadastrarCepPage";
import { ImoveisPage } from "@/pages/ImoveisPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/ceps" replace />} />
        <Route path="/ceps" element={<CadastrarCepPage />} />
        <Route path="/imoveis" element={<ImoveisPage />} />
      </Route>
    </Routes>
  );
}

export default App;
