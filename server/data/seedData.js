// Default authorized Facility Manager signature SVG/Data URI
export const DEFAULT_MANAGER_SIGNATURE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='70' viewBox='0 0 220 70'><path d='M20,48 C35,20 45,15 52,40 C58,60 52,65 65,30 C75,10 85,25 90,45 C95,58 110,35 125,25 C140,15 150,45 165,35 C175,28 185,42 205,30' fill='none' stroke='%23111111' stroke-width='2.2' stroke-linecap='round'/><path d='M30,52 C60,48 110,46 195,50' fill='none' stroke='%23111111' stroke-width='1.8' stroke-linecap='round'/><circle cx='180' cy='32' r='2' fill='%23111111'/></svg>";

export const INITIAL_FLATS = [
  {
    id: "flat-1",
    name: "Azalea C1",
    block: "Block C",
    floor: "1st Floor",
    type: "2 Bedroom Executive Suite",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Spacious master bedroom with pool view, modern kitchenette & fast Wi-Fi."
  },
  {
    id: "flat-2",
    name: "Hibiscus B4",
    block: "Block B",
    floor: "4th Floor",
    type: "3 Bedroom Penthouse Suite",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Panoramic terrace overlooking the estate gardens with luxury fittings."
  },
  {
    id: "flat-3",
    name: "Jasmine A2",
    block: "Block A",
    floor: "2nd Floor",
    type: "1 Bedroom Studio Suite",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Cozy executive studio suitable for solo business travelers & short stays."
  },
  {
    id: "flat-4",
    name: "Orchid D3",
    block: "Block D",
    floor: "3rd Floor",
    type: "2 Bedroom Premium Flat",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Contemporary styling with private balcony and automated access."
  },
  {
    id: "flat-5",
    name: "Magnolia E1",
    block: "Block E",
    floor: "Ground Floor",
    type: "3 Bedroom Deluxe Suite",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Ground floor garden access suite with wheelchair accessible layout."
  },
  {
    id: "flat-6",
    name: "Rosewood A5",
    block: "Block A",
    floor: "5th Floor",
    type: "2 Bedroom City View",
    status: "available",
    currentGuest: null,
    currentPassId: null,
    description: "Quiet top-floor apartment with enhanced privacy and soundproofing."
  }
];

export const INITIAL_ADMIN = {
  id: "admin-01",
  name: "Engr. David Okon",
  role: "Chief Facility Manager",
  email: "manager@keffiapartments.ng",
  phone: "+234 803 000 1122",
  estateName: "KEFFI APARTMENT SUITES",
  estateAddress: "14 Keffi Street, Ikoyi / Victoria Island Axis, Lagos, Nigeria",
  gateContact: "+234 800 533 3442 (Main Gatehouse)",
  defaultSignature: DEFAULT_MANAGER_SIGNATURE,
  autoApprovalEnabled: true,
  strictIdCheck: true,
  notificationEmail: "security@keffiapartments.ng"
};
