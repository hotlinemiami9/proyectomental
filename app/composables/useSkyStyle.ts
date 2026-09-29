export type SkyStyleId = 'cristal' | 'linea' | 'orbita' | 'umbral'
export type CometKind = 'polvo' | 'tenue' | 'suave'

export interface SkyStyleOption {
  id: SkyStyleId
  label: string
}

export interface CometKindOption {
  id: CometKind
  label: string
}

export const skyStyles: SkyStyleOption[] = [
  { id: 'cristal', label: 'Cristal' },
  { id: 'linea', label: 'Línea' },
  { id: 'orbita', label: 'Órbita' },
  { id: 'umbral', label: 'Umbral' },
]

export const cometKinds: CometKindOption[] = [
  { id: 'polvo', label: 'Polvo' },
  { id: 'tenue', label: 'Tenue' },
  { id: 'suave', label: 'Suave' },
]

export function useSkyStyle() {
  const styleId = useState<SkyStyleId>('sky-style', () => 'cristal')
  const cometKind = useState<CometKind>('comet-kind-v3', () => 'polvo')
  return { styleId, styles: skyStyles, cometKind, cometKinds }
}
