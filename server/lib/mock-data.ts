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
    name: "Bristol Royal Infirmary (BRI)",
    type: "hospital",
    x: 38, y: 32, distance: 480,
    contact: "+44 117 923 0000",
    hours: "24 hours",
    address: "Upper Maudlin St, Bristol BS2 8HW",
    waitMinutes: 142,
    verifiedMinutesAgo: 4,
    callAhead: true,
    accessible: true,
    specialties: ["stroke", "paediatric", "maternity", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r2",
    name: "Southmead Hospital A&E",
    type: "hospital",
    x: 72, y: 22, distance: 1980,
    contact: "+44 117 950 5050",
    hours: "24 hours",
    address: "Southmead Rd, Westbury-on-Trym, Bristol BS10 5NB",
    waitMinutes: 88,
    verifiedMinutesAgo: 6,
    callAhead: false,
    accessible: true,
    specialties: ["stroke", "maternity", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r3",
    name: "South Bristol Community Hospital",
    type: "urgent",
    x: 62, y: 44, distance: 720,
    contact: "+44 117 964 2901",
    hours: "08:00 – 20:00",
    address: "Hengrove Promenade, Bristol BS14 0DE",
    waitMinutes: 35,
    verifiedMinutesAgo: 2,
    callAhead: true,
    accessible: true,
    specialties: ["general", "dental"],
    paymentModel: "nhs",
  },
  {
    id: "r4",
    name: "Callington Road Hospital",
    type: "urgent",
    x: 28, y: 70, distance: 1340,
    contact: "+44 117 919 5600",
    hours: "24 hours",
    address: "Callington Rd, Brislington, Bristol BS4 5BJ",
    waitMinutes: 55,
    verifiedMinutesAgo: 18,
    callAhead: true,
    accessible: false,
    specialties: ["mental", "general"],
    paymentModel: "nhs",
  },
  {
    id: "r5",
    name: "Boots Pharmacy - Broadmead",
    type: "pharmacy",
    x: 54, y: 60, distance: 310,
    contact: "+44 117 929 3631",
    hours: "08:30 – 19:00",
    address: "59 Broadmead, Bristol BS1 3EA",
    waitMinutes: 5,
    verifiedMinutesAgo: 11,
    callAhead: false,
    accessible: true,
    specialties: ["general", "sexual"],
    stockNote: "Salbutamol in stock",
    paymentModel: "nhs",
  },
  {
    id: "r6",
    name: "Jhoots Pharmacy - Hotwells",
    type: "pharmacy",
    x: 46, y: 78, distance: 920,
    contact: "+44 117 929 1918",
    hours: "09:00 – 18:30",
    address: "206 Hotwell Rd, Bristol BS8 4UR",
    waitMinutes: 10,
    verifiedMinutesAgo: 22,
    callAhead: true,
    accessible: true,
    specialties: ["general"],
    stockNote: "Emergency antibiotics available",
    paymentModel: "nhs",
  },
  {
    id: "r7",
    name: "Spire Bristol Hospital (Private)",
    type: "hospital",
    x: 82, y: 38, distance: 980,
    contact: "+44 117 980 4000",
    hours: "08:00 – 20:00",
    address: "The Redland Hill, Durdham Down, Bristol BS6 6UT",
    waitMinutes: 12,
    verifiedMinutesAgo: 1,
    callAhead: true,
    accessible: true,
    specialties: ["general", "dental", "maternity"],
    paymentModel: "private",
  },
  {
    id: "r8",
    name: "Bupa Health Centre - Queen Charlotte St",
    type: "urgent",
    x: 18, y: 42, distance: 1620,
    contact: "+44 117 929 1234",
    hours: "09:00 – 17:30",
    address: "36 Queen Charlotte St, Bristol BS1 4EX",
    waitMinutes: 25,
    verifiedMinutesAgo: 9,
    callAhead: true,
    accessible: true,
    specialties: ["general", "sexual"],
    paymentModel: "private",
  },
  {
    id: "r9",
    name: "LloydsPharmacy Central",
    type: "pharmacy",
    x: 80, y: 66, distance: 2210,
    contact: "+44 117 924 1000",
    hours: "08:00 – 20:00",
    address: "12 Clifton Down Rd, Clifton, Bristol BS8 4AD",
    waitMinutes: 8,
    verifiedMinutesAgo: 30,
    callAhead: false,
    accessible: false,
    specialties: ["general"],
    paymentModel: "nhs",
  },
];

export function waitTone(min: number): "low" | "med" | "high" {
  if (min <= 20) return "low";
  if (min <= 60) return "med";
  return "high";
}
