import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FullWidthLayout } from "@/components/layout/FullWidthLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CadastrarCepPage } from "@/pages/CadastrarCepPage";
import { ImoveisPage } from "@/pages/ImoveisPage";
import { AvaliacoesPage } from "@/pages/AvaliacoesPage";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
import { CalibradorPage } from "@/pages/calibrador/CalibradorPage";
import keycloak from "./keycloak";

function App() {
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then(() => setInicializado(true))
      .catch((err) => {
        console.error("Falha ao inicializar Keycloak:", err);
        setInicializado(true);
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(70).catch(() => keycloak.login());
    };
  }, []);

  if (!inicializado) {
    return null;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ceps" element={<CadastrarCepPage />} />
        <Route path="/imoveis" element={<ImoveisPage />} />
        <Route path="/avaliacoes" element={<AvaliacoesPage />} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      </Route>
      <Route element={<FullWidthLayout />}>
        <Route path="/calibrador" element={<CalibradorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
