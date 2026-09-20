/**
 * DashboardPageHeader — editorial page title + description.
 * Placed at the top of each dashboard page's content area.
 */
interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode; // optional right-side action button/element
}

export function DashboardPageHeader({ title, description, action }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "28px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--dash-ink)",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--dash-ink-3)",
              marginTop: "5px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
