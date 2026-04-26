export type ElementType = 'text' | 'photo' | 'sticker' | 'emoji' | 'bubble';

export interface ScrapbookElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  filter?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    paperType?: 'plain' | 'torn' | 'sticky' | 'lined' | 'envelope';
    bubbleType?: 'speech' | 'thought' | 'burst' | 'cloud';
    backgroundColor?: string;
    width?: number;
    height?: number;
  };
}

export interface ScrapbookPage {
  id: string;
  background: string;
  elements: ScrapbookElement[];
}
