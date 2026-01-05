import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ColaboradorNotificacoesPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notificações do colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Em breve você verá notificações e comunicados específicos aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
