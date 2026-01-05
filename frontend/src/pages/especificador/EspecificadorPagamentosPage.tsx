import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EspecificadorPagamentosPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Área para acompanhar pagamentos de comissões.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
