interface Props {
  title: string;
  value: string;
}

export default function KPICard({ title, value }: Props) {
  return (
    <div className="kpi-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
