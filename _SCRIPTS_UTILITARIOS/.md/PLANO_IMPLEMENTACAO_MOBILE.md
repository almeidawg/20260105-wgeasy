# 🚀 PLANO DE IMPLEMENTAÇÃO MOBILE - WGEASY

**Data:** 2026-01-01
**Duração:** 4 semanas
**Sprint:** Mobile First & Navigation UX

---

## 📋 ÍNDICE

1. [Sprint 1: Críticos](#sprint-1-críticos)
2. [Sprint 2-3: Importantes](#sprint-2-3-importantes)
3. [Sprint 4: Refinement](#sprint-4-refinement)
4. [Código Pronto para Implementar](#código-pronto-para-implementar)

---

## SPRINT 1: CRÍTICOS

### ⭐ Tarefa 1: Unificar Mobile Navigation (8h)

**Objetivo:** Todos os layouts usam MobileBottomNav consistente

**Status:** 🔴 Não iniciado

**Código:**

```typescript
// src/components/mobile/MobileBottomNav.tsx (NOVO)
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  TrendingUp,
  Calendar,
  MoreVertical,
  X,
} from "lucide-react";
import { MobileMoreDrawer } from "./MobileMoreDrawer";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[]; // Se undefined, visível para todos
}

// Define itens mostrados na bottom nav (principais)
const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home size={24} />,
    href: "/",
  },
  {
    id: "pessoas",
    label: "Pessoas",
    icon: <Users size={24} />,
    href: "/pessoas",
    roles: ["colaborador", "admin"], // Só para estes roles
  },
  {
    id: "comercial",
    label: "Comercial",
    icon: <TrendingUp size={24} />,
    href: "/comercial",
    roles: ["comercial", "admin"],
  },
  {
    id: "cronograma",
    label: "Projetos",
    icon: <Calendar size={24} />,
    href: "/cronograma",
  },
];

// Itens no menu "Mais"
const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    id: "financeiro",
    label: "Financeiro",
    icon: "💰",
    href: "/financeiro",
    roles: ["admin", "financeiro"],
  },
  {
    id: "estoque",
    label: "Estoque",
    icon: "📦",
    href: "/estoque",
    roles: ["admin"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: "📊",
    href: "/relatorios",
    roles: ["admin"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: "⚙️",
    href: "/configuracoes",
  },
];

interface MobileBottomNavProps {
  userRole?: string;
}

export function MobileBottomNav({
  userRole = "usuario",
}: MobileBottomNavProps) {
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Filtrar itens por role
  const visibleItems = PRIMARY_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40
                   md:hidden" // Hide on desktop
        style={{ height: "80px" }}
      >
        <div className="h-full flex items-stretch justify-between">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                transition-colors duration-200
                ${
                  location.pathname === item.href
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
              aria-label={item.label}
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="text-xs font-medium text-center line-clamp-1">
                {item.label}
              </span>
            </button>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1
              transition-colors duration-200
              ${
                moreDrawerOpen
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
            aria-label="Mais opções"
          >
            <MoreVertical size={24} />
            <span className="text-xs font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      <MobileMoreDrawer
        open={moreDrawerOpen}
        onClose={() => setMoreDrawerOpen(false)}
        items={SECONDARY_NAV_ITEMS}
        userRole={userRole}
        currentPath={location.pathname}
        onNavigate={(href) => {
          handleNavigation(href);
          setMoreDrawerOpen(false);
        }}
      />

      {/* Overlay for drawer */}
      {moreDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMoreDrawerOpen(false)}
        />
      )}
    </>
  );
}
```

```typescript
// src/components/mobile/MobileMoreDrawer.tsx (NOVO/ATUALIZAR)
import { X, ChevronRight } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: string | React.ReactNode;
  href: string;
  roles?: string[];
}

interface MobileMoreDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  userRole: string;
  currentPath: string;
  onNavigate: (href: string) => void;
}

export function MobileMoreDrawer({
  open,
  onClose,
  items,
  userRole,
  currentPath,
  onNavigate,
}: MobileMoreDrawerProps) {
  const visibleItems = items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <div
      className={`
        fixed inset-y-0 right-0 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        z-50 md:hidden
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Menu</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Fechar menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Items */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 60px)" }}
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.href)}
            className={`
              w-full flex items-center justify-between p-4 border-b
              transition-colors duration-200
              ${
                currentPath === item.href
                  ? "bg-orange-50 text-orange-600"
                  : "hover:bg-gray-50 text-gray-700"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Footer spacer */}
      <div style={{ height: "80px" }} />
    </div>
  );
}
```

**Atualizações em Layouts:**

```typescript
// src/layout/MainLayout.tsx (ATUALIZAR)
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useAuth } from "@/auth/AuthContext";

export function MainLayout() {
  const { userRole } = useAuth(); // ou pegar de context/localStorage

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex">
        {/* Sidebar - Desktop only */}
        <Sidebar className="hidden md:block" />

        {/* Main content */}
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav - Mobile only */}
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}

// src/layout/FornecedorLayout.tsx (ATUALIZAR)
export function FornecedorLayout() {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}

// src/layout/ColaboradorLayout.tsx (ATUALIZAR)
export function ColaboradorLayout() {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}
```

**Verificação:**

- [ ] MobileBottomNav renderiza corretamente
- [ ] Drawer abre/fecha suavemente
- [ ] Navegação funciona em todos os layouts
- [ ] Styles corretos para mobile
- [ ] Teste em iPhone 12 mini (320px), iPhone 12 (390px), iPad (768px)

---

### ⭐ Tarefa 2: Criar ResponsiveTable Componente (8h)

**Objetivo:** Tabelas se transformam em cards em mobile

```typescript
// src/components/ResponsiveTable.tsx (NOVO)
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  width?: string;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  rowKey?: string;
  onRowClick?: (row: any) => void;
  className?: string;
  cardClassName?: string;
}

export function ResponsiveTable({
  data,
  columns,
  rowKey = "id",
  onRowClick,
  className = "",
  cardClassName = "",
}: ResponsiveTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((row) => (
          <div
            key={row[rowKey]}
            onClick={() => onRowClick?.(row)}
            className={`
              border border-gray-200 rounded-lg p-4
              bg-white hover:shadow-md transition-shadow cursor-pointer
              ${cardClassName}
            `}
          >
            {/* Grid 2 colunas em mobile */}
            <div className="grid grid-cols-2 gap-4">
              {columns.map((column) => (
                <div key={column.key}>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {column.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick?.(row);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left font-semibold text-gray-700 ${column.className}`}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 ${column.className}`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Hook necessário:**

```typescript
// src/hooks/useMediaQuery.ts (NOVO)
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
```

**Usar em ComprasPage:**

```typescript
// src/pages/ComprasPage.tsx (ATUALIZAR)
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { formatarValor, formatarData } from "@/utils/formatters";

export function ComprasPage() {
  const { compras } = useCompras();

  const columns = [
    {
      key: "numero",
      label: "Número",
      render: (value) => <strong>#{value}</strong>,
    },
    {
      key: "fornecedor",
      label: "Fornecedor",
      render: (value) => <span>{value.nome}</span>,
    },
    {
      key: "valor_total",
      label: "Valor",
      render: (value) => formatarValor(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "Aprovado" ? "success" : "warning"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "data_criacao",
      label: "Data",
      render: (value) => formatarData(value),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Compras</h1>
      <ResponsiveTable
        data={compras}
        columns={columns}
        rowKey="id"
        onRowClick={(row) => navigate(`/compras/${row.id}`)}
      />
    </div>
  );
}
```

---

### ⭐ Tarefa 3: Implementar Touch Targets (4h)

```css
/* src/styles/touch-targets.css (NOVO) */

/* iOS recomenda 44pt mínimo, Android 48dp
   1pt = 1.33px, então 44pt ≈ 58px, 48dp = 48px */

button,
[role="button"],
a,
[role="link"],
input[type="checkbox"],
input[type="radio"],
.clickable,
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Em telas menores que 768px (mobile), aumentar mais */
@media (max-width: 768px) {
  button,
  [role="button"],
  a[href],
  [role="link"],
  .touchable {
    min-height: 48px;
    padding: 12px 16px;
    font-size: 16px;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  input,
  select,
  textarea {
    min-height: 48px;
    padding: 12px;
    font-size: 16px;
    /* Previne zoom ao focar em iOS */
    font-size: 16px;
    -webkit-appearance: none;
    appearance: none;
  }

  /* Remover zoom ao focar em input */
  input:focus,
  select:focus,
  textarea:focus {
    font-size: 16px;
  }

  /* Buttons em lista */
  .list-item button {
    min-height: 56px;
    padding: 12px;
  }

  /* Spacing entre elementos clicáveis */
  button + button,
  button + a,
  a + a {
    margin-left: 8px;
  }
}

/* Em desktops, voltar ao normal */
@media (min-width: 769px) {
  button,
  [role="button"],
  input,
  select {
    min-height: auto;
    min-width: auto;
    padding: auto;
    font-size: auto;
  }
}
```

**Adicionar em tailwind.config.js:**

```javascript
// tailwind.config.js (ATUALIZAR)
export default {
  theme: {
    extend: {
      spacing: {
        // Espaços para touch targets
        "touch-target": "48px",
      },
    },
  },
  plugins: [],
};
```

**Aplicar em componentes:**

```typescript
// src/components/Button.tsx (ATUALIZAR)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger";
}

export function Button({
  size = "md",
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base md:px-3 md:py-2", // Mobile: maior
    lg: "px-6 py-4 text-lg md:px-4 md:py-3",
  };

  const variantClasses = {
    primary: "bg-orange-600 text-white hover:bg-orange-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`
        rounded-lg font-medium transition-colors
        min-h-[48px] min-w-[48px] md:min-h-auto md:min-w-auto
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## SPRINT 2-3: IMPORTANTES

### 💎 Tarefa 4: FormWizard para Contratos (12h)

```typescript
// src/components/FormWizard.tsx (NOVO)
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validate?: (data: any) => boolean | string;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  help?: string;
  validation?: (value: any) => boolean | string;
}

interface FormWizardProps {
  steps: WizardStep[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function FormWizard({
  steps,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
}: FormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    currentStep.fields.forEach((field) => {
      const value = data[field.name];

      // Validação obrigatória
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} é obrigatório`;
        return;
      }

      // Validação customizada
      if (field.validation && value) {
        const result = field.validation(value);
        if (result !== true) {
          newErrors[field.name] = result as string;
        }
      }
    });

    // Validação do passo
    if (currentStep.validate) {
      const stepValidation = currentStep.validate(data);
      if (stepValidation !== true) {
        setErrors({
          ...newErrors,
          _step: stepValidation as string,
        });
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStepIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setErrors({});
    setCurrentStepIndex((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFieldChange = (name: string, value: any) => {
    setData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro ao alterar
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <div
            className="bg-orange-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step header */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {currentStep.title}
        </h2>
        {currentStep.description && (
          <p className="text-sm md:text-base text-gray-600">
            {currentStep.description}
          </p>
        )}
      </div>

      {/* Step error */}
      {errors._step && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors._step}</p>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-5">
        {currentStep.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "select" ? (
              <select
                value={data[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-lg text-base
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                  ${errors[field.name] ? "border-red-500" : "border-gray-300"}
                `}
              >
                <option value="">{field.placeholder || "Selecionar..."}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={data[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className={`
                  w-full px-4 py-3 border rounded-lg text-base
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                  ${errors[field.name] ? "border-red-500" : "border-gray-300"}
                `}
              />
            ) : (
              <input
                type={field.type}
                value={data[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`
                  w-full px-4 py-3 border rounded-lg text-base
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                  min-h-[48px] md:min-h-auto
                  ${errors[field.name] ? "border-red-500" : "border-gray-300"}
                `}
              />
            )}

            {errors[field.name] && (
              <p className="text-sm text-red-600">{errors[field.name]}</p>
            )}

            {field.help && (
              <p className="text-xs text-gray-500">{field.help}</p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <button
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 min-h-[48px] md:min-h-auto"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        )}

        <button
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 min-h-[48px] md:min-h-auto"
        >
          {isSubmitting ? (
            <>Salvando...</>
          ) : isLastStep ? (
            <>
              <Check size={20} />
              {submitLabel}
            </>
          ) : (
            <>
              <span>Próximo</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
```

**Usar em Contratos:**

```typescript
// src/pages/NovoContratoPage.tsx (NOVO/ATUALIZAR)
import { FormWizard, type WizardStep } from "@/components/FormWizard";
import { useContratos } from "@/hooks/useContratos";

export function NovoContratoPage() {
  const navigate = useNavigate();
  const { criarContrato } = useContratos();

  const steps: WizardStep[] = [
    {
      id: "cliente-valor",
      title: "Cliente e Valor",
      description: "Selecione o cliente e defina o valor do contrato",
      fields: [
        {
          name: "cliente_id",
          label: "Cliente",
          type: "select",
          required: true,
          placeholder: "Escolha um cliente",
          options: [], // Preenchido dinamicamente
        },
        {
          name: "valor_total",
          label: "Valor Total",
          type: "number",
          required: true,
          placeholder: "R$ 0,00",
          validation: (v) => v > 0 || "Valor deve ser maior que 0",
        },
      ],
    },
    {
      id: "distribuicao",
      title: "Distribuição de Valores",
      description: "Divida o valor entre mão de obra e materiais",
      fields: [
        {
          name: "valor_mao_obra",
          label: "Mão de Obra",
          type: "number",
          required: true,
          placeholder: "R$ 0,00",
        },
        {
          name: "valor_materiais",
          label: "Materiais",
          type: "number",
          required: true,
          placeholder: "R$ 0,00",
        },
        {
          name: "valor_outros",
          label: "Outros",
          type: "number",
          placeholder: "R$ 0,00",
        },
      ],
      validate: (data) => {
        const total =
          (data.valor_mao_obra || 0) +
          (data.valor_materiais || 0) +
          (data.valor_outros || 0);
        if (Math.abs(total - data.valor_total) > 0.01) {
          return `Total (${total}) não corresponde ao valor do contrato (${data.valor_total})`;
        }
        return true;
      },
    },
    {
      id: "detalhes",
      title: "Detalhes do Contrato",
      description: "Informações adicionais",
      fields: [
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "rascunho", label: "Rascunho" },
            { value: "pendente", label: "Pendente" },
            { value: "ativo", label: "Ativo" },
          ],
        },
        {
          name: "data_inicio",
          label: "Data de Início",
          type: "date",
          required: true,
        },
        {
          name: "data_termino",
          label: "Data de Término",
          type: "date",
          required: false,
        },
      ],
    },
    {
      id: "revisao",
      title: "Revisão Final",
      description: "Confira os dados antes de salvar",
      fields: [
        {
          name: "_review",
          label: "Dados prontos para serem salvos",
          type: "text",
          required: false,
        },
      ],
    },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await criarContrato(data);
      toast.success("Contrato criado com sucesso!");
      navigate("/contratos");
    } catch (error) {
      toast.error("Erro ao criar contrato");
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/contratos")}
        submitLabel="Criar Contrato"
      />
    </div>
  );
}
```

---

### 💎 Tarefa 5: Swipe Gestures (6h)

```typescript
// src/hooks/useSwipe.ts (NOVO)
import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: SwipeHandlers) {
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEnd.current = e.changedTouches[0].clientX;
      touchEndY.current = e.changedTouches[0].clientY;

      const distance = touchStart.current - touchEnd.current;
      const distanceY = touchStartY.current - touchEndY.current;

      // Horizontal swipe
      if (
        Math.abs(distance) > threshold &&
        Math.abs(distance) > Math.abs(distanceY)
      ) {
        if (distance > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }

      // Vertical swipe
      if (
        Math.abs(distanceY) > threshold &&
        Math.abs(distanceY) > Math.abs(distance)
      ) {
        if (distanceY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    },
    [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  return { onTouchStart, onTouchEnd };
}
```

**Usar em lista:**

```typescript
// src/pages/ContratosPage.tsx (ATUALIZAR)
import { useSwipe } from "@/hooks/useSwipe";

export function ContratosPage() {
  const navigate = useNavigate();
  const { contratos } = useContratos();

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      // Abrir filtros/menu
      console.log("Swipe left - abrir menu");
    },
    onSwipeRight: () => {
      // Voltar
      navigate(-1);
    },
  });

  return (
    <div {...swipeHandlers} className="space-y-4">
      <h1 className="text-2xl font-bold">Contratos</h1>
      <ResponsiveTable
        data={contratos}
        columns={[
          { key: "numero", label: "Número" },
          { key: "cliente", label: "Cliente" },
          { key: "valor_total", label: "Valor" },
          { key: "status", label: "Status" },
        ]}
        onRowClick={(row) => navigate(`/contratos/${row.id}`)}
      />
    </div>
  );
}
```

---

## SPRINT 4: REFINEMENT

### 🎯 Tarefas Restantes

1. **ResponsiveBreadcrumb (2h)**
2. **Image Optimization (4h)**
3. **Mobile Error Messages (3h)**
4. **Pull-to-Refresh (4h)**
5. **Testing & QA (8h)**

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1 (Críticos)

- [ ] MobileBottomNav criado e integrado
- [ ] ResponsiveTable componente pronto
- [ ] Touch targets implementados
- [ ] Testado em 3 tamanhos de tela

### Semana 2-3 (Importantes)

- [ ] FormWizard funcionando
- [ ] Swipe gestures integrados
- [ ] BreadCrumbs responsive
- [ ] Imagens otimizadas

### Semana 4 (Refinement)

- [ ] Pull-to-refresh funcionando
- [ ] Erro messages mobile-friendly
- [ ] Performance >85 (Lighthouse)
- [ ] Testado em device real

---

**Status:** ✅ Pronto para implementação
**Última atualização:** 2026-01-01
**Próxima revisão:** Após Semana 1
