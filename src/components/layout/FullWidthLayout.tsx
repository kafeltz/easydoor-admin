import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Toaster } from "sonner";

export function FullWidthLayout() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <Outlet />
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
