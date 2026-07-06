export type DetailRow = {
  label: string;
  value: string;
  sub?: string;
  note?: string;
  accent?: string;
  onPress?: () => void;
};

export type DetailChartPoint = {
  label: string;
  value: number;
  display: string;
};

export type DetailSection = {
  title: string;
  rows: DetailRow[];
  emptyText?: string;
  chart?: DetailChartPoint[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  headerValue?: string;
};

export type DetailBack = {
  label: string;
  onPress: () => void;
};

export type DetailTab = {
  id: string;
  label: string;
  accent?: string;
  badge?: number;
  sections: DetailSection[];
};

export type DetailContent = {
  title: string;
  subtitle: string;
  sections: DetailSection[];
  tabs?: DetailTab[];
  back?: DetailBack;
};
