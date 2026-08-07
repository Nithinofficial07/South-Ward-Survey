import raw from "@/data/wardData.json";

export type CostKey = "road" | "ugd" | "attach" | "swg" | "jal" | "signage";

export type ConditionTally = { Good: number; Maintenance: number; Required: number; Unknown: number };

export type Ward = {
  ward: number;
  name: string;
  segments: number;
  length: number;
  areaSqm: number;
  total: number;
  cost: Record<CostKey, number>;
  elecCond: ConditionTally;
  elecSegments: number;
  cond: ConditionTally;
  materials: { name: string; count: number }[];
  areas: { name: string; segments: number; cost: number; length: number }[];
  areaCount: number;
};

export type AttachSlot = {
  side: "N/E" | "S/W";
  type: string | null;
  width: number | null;
  cond: string | null;
  notes: string | null;
  cost: number;
};

export type SwgSlot = {
  side: "N/E" | "S/W";
  type: string | null;
  width: number | null;
  cond: string | null;
  notes: string | null;
  cost: number;
};

export type RoadDetail = {
  use: string | null;
  sign: string | null;
  road: { action: string; cost: number };
  ugd: { existing: string | null; type: string | null; dia: number | null; cond: string | null; action: string; cost: number };
  attach: AttachSlot[];
  swg: SwgSlot[];
  jal: { existing: string | null; cond: string | null; notes: string | null; action: string; cost: number };
  elec: { lightType: string | null; cond: string | null; notes: string | null };
};

export type Road = {
  w: number;
  no: number;
  a: string;
  m: string;
  c: string;
  mat: string;
  cond: string;
  d: number;
  wd: number;
  cost: number;
  map: string;
  detail: RoadDetail;
};

export type PriorityCat = "road" | "ugd" | "attach" | "swg" | "jal" | "elec";
export type ConditionKey = "Good" | "Maintenance" | "Required" | "Unknown";

/** One row per (segment, category) — every segment's status in every category, not just urgent ones. */
export type WorkItem = {
  ward: number;
  no: number;
  cat: PriorityCat;
  cond: ConditionKey;
  area: string;
  main: string;
  cross: string;
  action: string;
  cost: number;
  map: string;
};

export const wards = (raw as unknown as { wards: Ward[] }).wards;
export const roads = (raw as unknown as { roads: Road[] }).roads;
export const workItems = (raw as unknown as { workItems: WorkItem[] }).workItems;

/** Items flagged Required — the urgent subset of workItems. */
export const priority = workItems.filter((i) => i.cond === "Required");

export const wardByNumber = new Map(wards.map((w) => [w.ward, w]));

export function wardName(w: number) {
  return wardByNumber.get(w)?.name ?? `Ward ${w}`;
}

const roadByKey = new Map(roads.map((r) => [`${r.w}-${r.no}`, r]));

export function findRoad(ward: number, no: number): Road | undefined {
  return roadByKey.get(`${ward}-${no}`);
}

export function priorityByWard() {
  const map = new Map<number, { count: number; cost: number; items: WorkItem[] }>();
  for (const w of wards) map.set(w.ward, { count: 0, cost: 0, items: [] });
  for (const p of priority) {
    const entry = map.get(p.ward);
    if (!entry) continue;
    entry.count += 1;
    entry.cost += p.cost;
    entry.items.push(p);
  }
  return map;
}

export function workItemsByWard() {
  const map = new Map<number, WorkItem[]>();
  for (const w of wards) map.set(w.ward, []);
  for (const item of workItems) {
    map.get(item.ward)?.push(item);
  }
  return map;
}

export const PRIORITY_LABELS: Record<PriorityCat, string> = {
  road: "Road",
  ugd: "UGD",
  attach: "Attachment",
  swg: "SWG",
  jal: "Jalasiri",
  elec: "Electrical",
};

export const PRIORITY_CATS: PriorityCat[] = ["road", "attach", "swg", "ugd", "jal", "elec"];
export const CONDITION_KEYS: ConditionKey[] = ["Required", "Maintenance", "Good", "Unknown"];

export const COST_LABELS: Record<CostKey, string> = {
  road: "Road Surface",
  ugd: "Underground Drain",
  attach: "Footpath / Attachment",
  swg: "Storm Water Drain (SWD)",
  jal: "Jalasiri Water Line",
  signage: "Road Signage",
};

/** The 5 categories with a defined cost rate — shown as clickable investment cards. */
export const CARD_KEYS = ["road", "ugd", "attach", "swg", "jal"] as const;

export const COST_COLORS: Record<CostKey, string> = {
  road: "var(--teal)",
  ugd: "var(--sky)",
  attach: "var(--amber)",
  swg: "var(--violet)",
  jal: "var(--lime)",
  signage: "var(--coral)",
};

export const CONDITION_COLORS: Record<string, string> = {
  Good: "var(--good)",
  Maintenance: "var(--maint)",
  Required: "var(--req)",
  Unknown: "var(--unknown)",
};

export const totals = {
  wards: wards.length,
  segments: wards.reduce((s, w) => s + w.segments, 0),
  length: wards.reduce((s, w) => s + w.length, 0),
  areaSqm: wards.reduce((s, w) => s + w.areaSqm, 0),
  cost: wards.reduce((s, w) => s + w.total, 0),
  byCategory: (Object.keys(COST_LABELS) as CostKey[]).map((k) => ({
    key: k,
    label: COST_LABELS[k],
    value: wards.reduce((s, w) => s + w.cost[k], 0),
  })),
  condition: wards.reduce(
    (acc, w) => {
      acc.Good += w.cond.Good;
      acc.Maintenance += w.cond.Maintenance;
      acc.Required += w.cond.Required;
      acc.Unknown += w.cond.Unknown;
      return acc;
    },
    { Good: 0, Maintenance: 0, Required: 0, Unknown: 0 },
  ),
};

export function inr(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function km(m: number) {
  return `${(m / 1000).toFixed(1)} km`;
}

const SQM_PER_ACRE = 4046.86;

export function acres(areaSqm: number) {
  return `${(areaSqm / SQM_PER_ACRE).toFixed(2)} ac`;
}

/** Distinct localities recorded across the whole register (best available stand-in for "villages"). */
export const totalLocalities = new Set(roads.map((r) => r.a).filter(Boolean)).size;

/** Rates used for the "unit rate" sublabel on estimation figures — mirrors scripts/build-ward-data.py RATES. */
export const UNIT_RATES: Record<string, string> = {
  "road:Convert to concrete": "₹3,500/sqm",
  "ugd:New installation": "₹5,000/m",
  "ugd:Repair (Maintenance)": "₹1,067/m",
  "ugd:Repair (Outdated)": "₹1,600/m",
  "ugd:Repair (Required)": "₹2,667/m",
  "ugd:Repair (Additional Required)": "₹4,000/m",
  "attach:Maintenance": "₹1,150/sqm",
  "attach:Outdated": "₹1,690/sqm",
  "attach:Required": "₹2,876/sqm",
  "attach:Additional Required": "₹4,313/sqm",
  "swg:Maintenance": "₹400/m",
  "swg:Outdated": "₹600/m",
  "swg:Required": "₹1,000/m",
  "swg:Additional Required": "₹1,500/m",
  "jal:Maintenance": "₹5,000 flat",
  "jal:Reactivation required": "₹10,000 flat",
  "jal:New installation": "₹10,000 flat",
  "signage:Installation required": "₹5,000 flat",
  "signage:Replacement required": "₹5,000 flat",
};

export const WARD_ACCENTS = [
  "var(--teal)",
  "var(--amber)",
  "var(--violet)",
  "var(--lime)",
  "var(--coral)",
  "var(--sky)",
];

export function wardAccent(i: number) {
  return WARD_ACCENTS[i % WARD_ACCENTS.length];
}

/** Number of surveyed segments in a ward that actually need paid-for work. */
export function wardWorksCount(ward: number) {
  return roads.filter((r) => r.w === ward && r.cost > 0).length;
}
