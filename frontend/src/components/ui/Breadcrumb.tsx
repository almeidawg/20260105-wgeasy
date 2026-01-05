import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb flex items-center">
      {items.map((item, i) => (
        <div key={i} className="flex items-center">
          {i < items.length - 1 ? (
            item.href ? (
              <Link to={item.href} className="breadcrumb-item hover:text-[#F25C26] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-item text-gray-700">{item.label}</span>
            )
          ) : (
            <span className="breadcrumb-item text-gray-900 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && (
            <ChevronRight size={16} className="breadcrumb-sep mx-1 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}
