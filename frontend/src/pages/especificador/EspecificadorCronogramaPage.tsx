import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EspecificadorCronogramaPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cronograma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cronogramas e entregas do especificador aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
