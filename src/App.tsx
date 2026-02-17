import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CadastrarCepPage } from "@/pages/CadastrarCepPage";
import { ImoveisPage } from "@/pages/ImoveisPage";
import { AvaliacoesPage } from "@/pages/AvaliacoesPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/ceps" replace />} />
        <Route path="/ceps" element={<CadastrarCepPage />} />
        <Route path="/imoveis" element={<ImoveisPage />} />
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
