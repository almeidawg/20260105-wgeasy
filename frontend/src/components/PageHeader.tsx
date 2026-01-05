interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h1 className="main-title">{title}</h1>
      {subtitle && <p className="main-subtitle">{subtitle}</p>}
    </div>
  );
}
