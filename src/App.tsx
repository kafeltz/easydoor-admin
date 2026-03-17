import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CadastrarCepPage } from "@/pages/CadastrarCepPage";
import { ImoveisPage } from "@/pages/ImoveisPage";
import { AvaliacoesPage } from "@/pages/AvaliacoesPage";
import { ConfiguracoesPage } from "@/pages/ConfiguracoesPage";
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

    const refreshInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(60).catch(() => keycloak.login());
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(refreshInterval);
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
    </Routes>
  );
}

export default App;
