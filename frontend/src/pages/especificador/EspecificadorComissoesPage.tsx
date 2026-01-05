import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EspecificadorComissoesPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Em breve: extratos e comissões calculadas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
