import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EspecificadorDashboardPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Painel do especificador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Resumo e atalhos rápidos estarão disponíveis aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
