import { BookingType, ShipmentKind } from '@/shared';

/** Field keys that can participate in regular account Tab navigation */
export const ACCOUNT_TAB_FIELDS = [
  { key: 'bookingDate', label: 'Booking date' },
  { key: 'customer', label: 'Party' },
  { key: 'courierCompany', label: 'Courier company' },
  { key: 'documentNumber', label: 'Document number' },
  { key: 'destination', label: 'Destination' },
  { key: 'receiverName', label: 'Receiver name' },
  { key: 'receiverPhone', label: 'Receiver phone' },
  { key: 'receiverAddress', label: 'Receiver address' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'weight', label: 'Weight' },
  { key: 'numberOfBoxes', label: 'Number of boxes' },
  { key: 'price', label: 'Price' },
  { key: 'remarks', label: 'Remarks' },
] as const;

/** Field keys for regular cash Tab navigation */
export const CASH_TAB_FIELDS = [
  { key: 'bookingDate', label: 'Booking date' },
  { key: 'partyName', label: 'Party name' },
  { key: 'courierCompany', label: 'Courier company' },
  { key: 'documentNumber', label: 'Document number' },
  { key: 'destination', label: 'Destination' },
  { key: 'partyPhone', label: 'Party phone' },
  { key: 'partyAddress', label: 'Party address' },
  { key: 'partyCity', label: 'Party city' },
  { key: 'partyGstin', label: 'Party GSTIN' },
  { key: 'receiverName', label: 'Receiver name' },
  { key: 'receiverPhone', label: 'Receiver phone' },
  { key: 'receiverAddress', label: 'Receiver address' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'weight', label: 'Weight' },
  { key: 'numberOfBoxes', label: 'Number of boxes' },
  { key: 'price', label: 'Price' },
  { key: 'cgst', label: 'CGST' },
  { key: 'sgst', label: 'SGST' },
  { key: 'igst', label: 'IGST' },
  { key: 'remarks', label: 'Remarks' },
] as const;

/** Cargo account booking — includes cargo charge fields */
export const CARGO_ACCOUNT_TAB_FIELDS = [
  { key: 'bookingDate', label: 'Booking date' },
  { key: 'customer', label: 'Party' },
  { key: 'courierCompany', label: 'Courier company' },
  { key: 'documentNumber', label: 'Document number' },
  { key: 'destination', label: 'Destination' },
  { key: 'receiverName', label: 'Receiver name' },
  { key: 'receiverPhone', label: 'Receiver phone' },
  { key: 'receiverAddress', label: 'Receiver address' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'weight', label: 'Weight' },
  { key: 'numberOfBoxes', label: 'Number of boxes' },
  { key: 'price', label: 'Gross' },
  { key: 'otherChargeLabel', label: 'Other charge' },
  { key: 'otherChargeAmt', label: 'Other charge amt' },
  { key: 'fuelChargePercent', label: 'Fuel charge %' },
  { key: 'parcelValue', label: 'Parcel value' },
  { key: 'insuranceAmt', label: 'Insurance' },
  { key: 'ewayBillAmt', label: 'E-WayBill' },
  { key: 'remarks', label: 'Remarks' },
] as const;

/** Cargo cash booking — cargo charges + GST */
export const CARGO_CASH_TAB_FIELDS = [
  { key: 'bookingDate', label: 'Booking date' },
  { key: 'partyName', label: 'Party name' },
  { key: 'courierCompany', label: 'Courier company' },
  { key: 'documentNumber', label: 'Document number' },
  { key: 'destination', label: 'Destination' },
  { key: 'partyPhone', label: 'Party phone' },
  { key: 'partyAddress', label: 'Party address' },
  { key: 'partyCity', label: 'Party city' },
  { key: 'partyGstin', label: 'Party GSTIN' },
  { key: 'receiverName', label: 'Receiver name' },
  { key: 'receiverPhone', label: 'Receiver phone' },
  { key: 'receiverAddress', label: 'Receiver address' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'weight', label: 'Weight' },
  { key: 'numberOfBoxes', label: 'Number of boxes' },
  { key: 'price', label: 'Gross' },
  { key: 'otherChargeLabel', label: 'Other charge' },
  { key: 'otherChargeAmt', label: 'Other charge amt' },
  { key: 'fuelChargePercent', label: 'Fuel charge %' },
  { key: 'parcelValue', label: 'Parcel value' },
  { key: 'insuranceAmt', label: 'Insurance' },
  { key: 'ewayBillAmt', label: 'E-WayBill' },
  { key: 'cgst', label: 'CGST' },
  { key: 'sgst', label: 'SGST' },
  { key: 'igst', label: 'IGST' },
  { key: 'remarks', label: 'Remarks' },
] as const;

export type AccountTabFieldKey = (typeof ACCOUNT_TAB_FIELDS)[number]['key'];
export type CashTabFieldKey = (typeof CASH_TAB_FIELDS)[number]['key'];
export type CargoAccountTabFieldKey =
  (typeof CARGO_ACCOUNT_TAB_FIELDS)[number]['key'];
export type CargoCashTabFieldKey =
  (typeof CARGO_CASH_TAB_FIELDS)[number]['key'];
export type BookingTabFieldKey =
  | AccountTabFieldKey
  | CashTabFieldKey
  | CargoAccountTabFieldKey
  | CargoCashTabFieldKey;

export type BookingTabConfig = {
  account: string[];
  cash: string[];
  cargoAccount: string[];
  cargoCash: string[];
};

export function defaultBookingTabConfig(): BookingTabConfig {
  return {
    account: ACCOUNT_TAB_FIELDS.map((f) => f.key),
    cash: CASH_TAB_FIELDS.map((f) => f.key),
    cargoAccount: CARGO_ACCOUNT_TAB_FIELDS.map((f) => f.key),
    cargoCash: CARGO_CASH_TAB_FIELDS.map((f) => f.key),
  };
}

function filterKeys(
  raw: string[] | undefined,
  allowed: Set<string>,
  fallback: string[],
): string[] {
  if (!Array.isArray(raw)) return fallback;
  return raw.filter((k) => allowed.has(k));
}

export function normalizeBookingTabConfig(
  raw?: Partial<BookingTabConfig> | null,
): BookingTabConfig {
  const defaults = defaultBookingTabConfig();
  if (raw == null) return defaults;

  const accountAllowed = new Set(ACCOUNT_TAB_FIELDS.map((f) => f.key));
  const cashAllowed = new Set(CASH_TAB_FIELDS.map((f) => f.key));
  const cargoAccountAllowed = new Set(
    CARGO_ACCOUNT_TAB_FIELDS.map((f) => f.key),
  );
  const cargoCashAllowed = new Set(CARGO_CASH_TAB_FIELDS.map((f) => f.key));

  // Older configs only had account/cash (cargo fields mixed in).
  const legacyAccount = Array.isArray(raw.account) ? raw.account : null;
  const legacyCash = Array.isArray(raw.cash) ? raw.cash : null;

  return {
    account: filterKeys(raw.account, accountAllowed, defaults.account),
    cash: filterKeys(raw.cash, cashAllowed, defaults.cash),
    cargoAccount: filterKeys(
      raw.cargoAccount ?? legacyAccount ?? undefined,
      cargoAccountAllowed,
      defaults.cargoAccount,
    ),
    cargoCash: filterKeys(
      raw.cargoCash ?? legacyCash ?? undefined,
      cargoCashAllowed,
      defaults.cargoCash,
    ),
  };
}

type TabCatalog = readonly { key: string; label: string }[];

function resolveTabLists(
  mode: BookingType,
  shipmentKind: ShipmentKind | undefined,
  config?: BookingTabConfig | null,
): { catalog: TabCatalog; enabled: string[] } {
  const normalized = normalizeBookingTabConfig(config);
  const isCargo = shipmentKind === ShipmentKind.CARGO;
  if (mode === BookingType.ACCOUNT) {
    return {
      catalog: isCargo ? CARGO_ACCOUNT_TAB_FIELDS : ACCOUNT_TAB_FIELDS,
      enabled: isCargo ? normalized.cargoAccount : normalized.account,
    };
  }
  return {
    catalog: isCargo ? CARGO_CASH_TAB_FIELDS : CASH_TAB_FIELDS,
    enabled: isCargo ? normalized.cargoCash : normalized.cash,
  };
}

/** Tab index for a field: selected fields get 1..n in form order; others -1 (skipped). */
export function bookingFieldTabIndex(
  fieldKey: string,
  mode: BookingType,
  config?: BookingTabConfig | null,
  shipmentKind?: ShipmentKind,
): number {
  const { catalog, enabled } = resolveTabLists(mode, shipmentKind, config);
  const enabledSet = new Set(enabled);
  if (!enabledSet.has(fieldKey)) return -1;

  let order = 0;
  for (const f of catalog) {
    if (!enabledSet.has(f.key)) continue;
    order += 1;
    if (f.key === fieldKey) return order;
  }
  return -1;
}

/** Create / primary action sits after the last selected field. */
export function bookingActionTabIndex(
  mode: BookingType,
  config?: BookingTabConfig | null,
  shipmentKind?: ShipmentKind,
): number {
  const { enabled } = resolveTabLists(mode, shipmentKind, config);
  return Math.max(enabled.length, 0) + 1;
}
