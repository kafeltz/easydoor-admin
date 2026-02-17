import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ImoveisPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Imoveis</h1>
        <p className="text-muted-foreground mt-1">
          Gerenciamento de imoveis cadastrados
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Em breve</p>
          <p className="text-sm mt-1">
            Esta funcionalidade esta em desenvolvimento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
