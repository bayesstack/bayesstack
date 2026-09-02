import { type DbTable } from "@bayesstack/ui";

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeBounds extends NodePosition {
  width: number;
  height: number;
}

export interface Relationship {
  id: string;
  fromTable: string;
  fromCol: string;
  fromColIndex: number;
  toTable: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DragState {
  tableName: string;
  startX: number;
  startY: number;
  initialNodeX: number;
  initialNodeY: number;
}

export interface ErDiagramThemeTokens {
  canvasBg: string;
  dotColor: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  subtleText: string;
  inputBg: string;
  inputBorder: string;
  cardBg: string;
  cardHeaderBg: string;
  cardHeaderSelectedBg: string;
  cardBorder: string;
  cardBorderHover: string;
  cardBorderSelected: string;
  cardShadow: string;
  cardShadowSelected: string;
  cardTitle: string;
  colRowHover: string;
  colRowBorder: string;
  colName: string;
  colType: string;
  pkBg: string;
  pkColor: string;
  fkBg: string;
  fkColor: string;
  strokeNormal: string;
  strokeHighlighted: string;
  strokeHovered: string;
  markerFill: string;
  markerActiveFill: string;
  inspectorBg: string;
  inspectorBorder: string;
  inspectorHeaderBg: string;
  inspectorCardBg: string;
  inspectorCardBorder: string;
}
