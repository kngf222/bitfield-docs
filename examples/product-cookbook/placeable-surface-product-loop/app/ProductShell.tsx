import { useState } from 'react';
import type { PlaceableSurface } from './surfaces';

type SurfaceComponentProps = {
  surface: PlaceableSurface;
};

export type SurfaceRegistry = Record<string, React.ComponentType<SurfaceComponentProps>>;

type ProductShellProps = {
  surfaces: PlaceableSurface[];
  registry: SurfaceRegistry;
};

export function ProductShell({ surfaces, registry }: ProductShellProps) {
  const ordered = [...surfaces].sort((a, b) => a.order - b.order);
  const [activeSurfaceId, setActiveSurfaceId] = useState(ordered[0]?.id ?? '');
  const activeSurface = ordered.find((surface) => surface.id === activeSurfaceId) ?? ordered[0];
  const ActiveSurface = activeSurface ? registry[activeSurface.componentKey] : null;

  return (
    <div className="product-shell">
      <aside aria-label="Product surfaces">
        {ordered.map((surface) => (
          <button
            key={surface.id}
            type="button"
            aria-current={surface.id === activeSurface?.id ? 'page' : undefined}
            onClick={() => setActiveSurfaceId(surface.id)}
          >
            {surface.label}
          </button>
        ))}
      </aside>

      <main data-region={activeSurface?.region ?? 'main'}>
        {activeSurface && ActiveSurface ? <ActiveSurface surface={activeSurface} /> : null}
      </main>
    </div>
  );
}
