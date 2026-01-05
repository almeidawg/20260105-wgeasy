interface Props {
  title: string;
  children?: React.ReactNode;
}

export default function DashboardCard({ title, children }: Props) {
  return (
    <div className="dashboard-card">
      <h4>{title}</h4>
      <div className="dashboard-card-content">
        {children || <p>Conteúdo em breve...</p>}
      </div>
    </div>
  );
}
