interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div
      className={`page-header-inline ${className ?? ""}`}
      style={{ marginBottom: "22px" }}
    >
      <div className="page-header-first-line">
        <h1 className="page-header-title">{title}</h1>
      </div>
      {subtitle && (
        <p className="page-header-subtitle-inline">{subtitle}</p>
      )}
    </div>
  );
}
