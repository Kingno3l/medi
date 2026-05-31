export type ResourceType = "hospital" | "pharmacy" | "urgent";

export type Specialty =
  | "stroke"
  | "paediatric"
  | "mental"
  | "dental"
  | "maternity"
  | "sexual"
  | "general";

export const SPECIALTIES: { id: Specialty; label: string }[] = [
  { id: "stroke", label: "Stroke unit" },
  { id: "paediatric", label: "Paediatric A&E" },
  { id: "mental", label: "Mental health" },
  { id: "maternity", label: "Maternity" },
  { id: "dental", label: "Dental" },
  { id: "sexual", label: "Sexual health" },
];

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  x: number;
  y: number;
  distance: number; // meters
  contact: string;
  hours: string;
  address: string;
  // Differentiators vs Google Maps
  waitMinutes: number; // current reported wait (A&E / queue)
  verifiedMinutesAgo: number; // last data verification
  callAhead: boolean; // accepts call-ahead booking
  accessible: boolean; // step-free + accessible
  specialties: Specialty[];
  stockNote?: string; // pharmacy-only
  paymentModel: "nhs" | "private";
}

export const RADIUS_M = 2500;

export const MOCK_RESOURCES: Resource[] = [
  {
    id: "r1",
    name: "St. Mary's General Hospital",
    type: "hospital",
    x: 38, y: 32, distance: 480,
    contact: "+44 20 7946 0001",
    hours: "24 hours",
    address: "12 Praed Street",
    waitMinutes: 142,
    verifiedMinutesAgo: 4,
    callAhead: true,
    accessible: true,
    specialties: ["stroke", "maternity", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r2",
    name: "Riverside Urgent Care",
    type: "urgent",
    x: 62, y: 44, distance: 720,
    contact: "+44 20 7946 0023",
    hours: "08:00 – 22:00",
    address: "44 Riverside Walk",
    waitMinutes: 35,
    verifiedMinutesAgo: 2,
    callAhead: true,
    accessible: true,
    specialties: ["general", "paediatric"],
    paymentModel: "nhs",
  },
  {
    id: "r3",
    name: "Boots Pharmacy 24h",
    type: "pharmacy",
    x: 54, y: 60, distance: 310,
    contact: "+44 20 7946 0145",
    hours: "24 hours",
    address: "7 High Street",
    waitMinutes: 5,
    verifiedMinutesAgo: 11,
    callAhead: false,
    accessible: true,
    specialties: ["general"],
    stockNote: "Salbutamol in stock",
    paymentModel: "nhs",
  },
  {
    id: "r4",
    name: "Northgate Medical Centre",
    type: "urgent",
    x: 28, y: 70, distance: 1340,
    contact: "+44 20 7946 0277",
    hours: "07:00 – 20:00",
    address: "90 Northgate Road",
    waitMinutes: 55,
    verifiedMinutesAgo: 18,
    callAhead: true,
    accessible: false,
    specialties: ["mental", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r5",
    name: "King's College Hospital",
    type: "hospital",
    x: 72, y: 22, distance: 1980,
    contact: "+44 20 7946 0399",
    hours: "24 hours",
    address: "Denmark Hill",
    waitMinutes: 88,
    verifiedMinutesAgo: 6,
    callAhead: false,
    accessible: true,
    specialties: ["stroke", "paediatric", "maternity"],
    paymentModel: "nhs",
  },
  {
    id: "r6",
    name: "GreenLeaf Pharmacy",
    type: "pharmacy",
    x: 46, y: 78, distance: 920,
    contact: "+44 20 7946 0410",
    hours: "08:00 – 23:00",
    address: "23 Park Lane",
    waitMinutes: 10,
    verifiedMinutesAgo: 22,
    callAhead: true,
    accessible: true,
    specialties: ["sexual", "general"],
    stockNote: "EllaOne available",
    paymentModel: "nhs",
  },
  {
    id: "r7",
    name: "Citycare Walk-In Clinic",
    type: "urgent",
    x: 18, y: 42, distance: 1620,
    contact: "+44 20 7946 0588",
    hours: "09:00 – 21:00",
    address: "5 Market Square",
    waitMinutes: 25,
    verifiedMinutesAgo: 9,
    callAhead: true,
    accessible: true,
    specialties: ["dental", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r8",
    name: "LloydsPharmacy Central",
    type: "pharmacy",
    x: 80, y: 66, distance: 2210,
    contact: "+44 20 7946 0633",
    hours: "08:00 – 20:00",
    address: "118 Central Ave",
    waitMinutes: 8,
    verifiedMinutesAgo: 30,
    callAhead: false,
    accessible: false,
    specialties: ["general"],
    paymentModel: "nhs",
  },
  {
    id: "r9",
    name: "Harley Street Urgent Care (Private)",
    type: "urgent",
    x: 82, y: 38, distance: 980,
    contact: "+44 20 7946 0888",
    hours: "09:00 – 19:00",
    address: "102 Harley Street",
    waitMinutes: 12,
    verifiedMinutesAgo: 1,
    callAhead: true,
    accessible: true,
    specialties: ["general", "paediatric"],
    paymentModel: "private",
  },
];

export function waitTone(min: number): "low" | "med" | "high" {
  if (min <= 20) return "low";
  if (min <= 60) return "med";
  return "high";
}
