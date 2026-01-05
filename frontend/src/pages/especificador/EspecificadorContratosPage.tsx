import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EspecificadorContratosPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Listagem e detalhes de contratos do especificador ficarão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
