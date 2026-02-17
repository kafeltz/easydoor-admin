import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Toaster } from "sonner";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Outlet />
      </main>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "hsl(215 55% 15%)",
            border: "1px solid hsl(215 35% 25%)",
            color: "hsl(210 20% 95%)",
          },
        }}
      />
    </div>
  );
}
