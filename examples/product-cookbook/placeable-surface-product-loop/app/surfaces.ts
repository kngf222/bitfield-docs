export type SurfaceRegion = 'main' | 'rail' | 'panel';

export type PlaceableSurface = {
  id: string;
  label: string;
  region: SurfaceRegion;
  order: number;
  componentKey: string;
  preparedInputs: string[];
  targets: string[];
};

export const launchSurfaces: PlaceableSurface[] = [
  {
    id: 'launch.home',
    label: 'Launch',
    region: 'main',
    order: 10,
    componentKey: 'surface.launch.home',
    preparedInputs: ['welcome-copy', 'launch-checklist'],
    targets: ['launch.next-step'],
  },
  {
    id: 'launch.help',
    label: 'Help',
    region: 'panel',
    order: 20,
    componentKey: 'surface.launch.help',
    preparedInputs: [],
    targets: ['help.search'],
  },
  {
    id: 'launch.support',
    label: 'Support',
    region: 'panel',
    order: 30,
    componentKey: 'surface.launch.support',
    preparedInputs: [],
    targets: [],
  },
];
