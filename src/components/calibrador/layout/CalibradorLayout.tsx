import { ReactNode } from "react";

interface CalibradorLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  footer: ReactNode;
}

export function CalibradorLayout({ sidebar, main, footer }: CalibradorLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[340px] min-w-[340px] border-r border-border overflow-y-auto bg-sidebar">
        {sidebar}
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {main}
        </main>
        <div className="border-t border-border">
          {footer}
        </div>
      </div>
    </div>
  );
}
