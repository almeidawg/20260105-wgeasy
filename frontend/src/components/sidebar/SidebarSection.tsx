interface Props {
  title: string;
}

export default function SidebarSection({ title }: Props) {
  return <div className="wg-sidebar-section-title">{title}</div>;
}
