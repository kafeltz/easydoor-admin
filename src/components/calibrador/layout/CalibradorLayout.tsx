import { ReactNode } from "react";

interface CalibradorLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function CalibradorLayout({ sidebar, main }: CalibradorLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[340px] min-w-[340px] border-r border-border overflow-y-auto bg-sidebar">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {main}
      </main>
    </div>
  );
}
