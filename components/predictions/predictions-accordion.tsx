"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Panel = "overall" | "event";

type Ctx = {
  open: Panel | null;
  setOpen: (p: Panel | null) => void;
};

const PredictionsAccordionContext = createContext<Ctx | null>(null);

function usePredictionsAccordion() {
  const c = useContext(PredictionsAccordionContext);
  if (!c) throw new Error("PredictionsAccordionSection outside provider");
  return c;
}

type ProviderProps = {
  children: ReactNode;
  /** When URL-derived state changes, reset which panel is open. */
  resetKey: string;
  /** Initial open panel from server (after search → Event; after Compare → Overall). */
  initialOpen: Panel | null;
};

export function PredictionsAccordionProvider({
  children,
  resetKey,
  initialOpen,
}: ProviderProps) {
  const [open, setOpen] = useState<Panel | null>(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [resetKey, initialOpen]);

  const set = useCallback((p: Panel | null) => {
    setOpen(p);
  }, []);

  return (
    <PredictionsAccordionContext.Provider value={{ open, setOpen: set }}>
      {children}
    </PredictionsAccordionContext.Provider>
  );
}

type SectionProps = {
  panel: Panel;
  children: ReactNode;
  className?: string;
  /** When this panel opens and this is true, scroll to element id. */
  scrollToIdOnOpen?: string | null;
};

export function PredictionsAccordionSection({
  panel,
  children,
  className,
  scrollToIdOnOpen,
}: SectionProps) {
  const { open, setOpen } = usePredictionsAccordion();
  const isOpen = open === panel;

  return (
    <details
      id={panel === "overall" ? "overall" : "event-analysis"}
      open={isOpen}
      onToggle={(e) => {
        const el = e.currentTarget;
        if (el.open) {
          setOpen(panel);
          if (scrollToIdOnOpen) {
            requestAnimationFrame(() => {
              document.getElementById(scrollToIdOnOpen)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            });
          }
        } else if (open === panel) {
          setOpen(null);
        }
      }}
      className={className}
    >
      {children}
    </details>
  );
}

/** After event search, scroll first matching card into view (section stays open via server initialOpen). */
export function PredictionsEventFirstHitScroll({
  enabled,
  targetId,
}: {
  enabled: boolean;
  targetId: string;
}) {
  useEffect(() => {
    if (!enabled) return;
    const id = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [enabled, targetId]);

  return null;
}
