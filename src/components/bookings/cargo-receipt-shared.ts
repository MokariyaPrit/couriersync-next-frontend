import { BookingType, CargoPrintTemplate, ShipmentKind } from '@/shared';
import { serviceTypeLabel } from '@/lib/quotations';

export type CargoReceiptDoc = {
  consignment: {
    id: string;
    awb: string;
    bookingType: BookingType;
    shipmentKind?: ShipmentKind;
    bookingDate: string | null;
    createdAt: string;
    senderName: string;
    senderPhone?: string | null;
    senderAddress?: string | null;
    receiverName: string;
    receiverPhone?: string | null;
    receiverAddress?: string | null;
    receiverCity?: string | null;
    receiverState?: string | null;
    receiverPincode?: string | null;
    rateSectionId?: string | null;
    weightKg: string;
    price: string;
    basePrice?: string | null;
    cgst?: string | null;
    sgst?: string | null;
    igst?: string | null;
    partyName?: string | null;
    customerName?: string | null;
    courierCompanyName?: string | null;
    remarks?: string | null;
    numberOfBoxes?: number | null;
    grossAmt?: string | number | null;
    otherChargeLabel?: string | null;
    otherChargeAmt?: string | number | null;
    fuelChargePercent?: string | number | null;
    fuelChargeAmt?: string | number | null;
    insuranceEnabled?: boolean;
    insurancePercent?: string | number | null;
    insuranceAmt?: string | number | null;
    ewayBillEnabled?: boolean;
    ewayBillPercent?: string | number | null;
    ewayBillAmt?: string | number | null;
    parcelValue?: string | number | null;
  };
  letterhead: {
    companyName: string;
    fullName?: string | null;
    phone?: string | null;
    gstin?: string | null;
    city?: string | null;
    state?: string | null;
    logoUrl?: string | null;
  };
};

export function formatSlipDate(iso?: string | null) {
  if (!iso) return '';
  const raw = String(iso).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy}`;
  }
  return raw;
}

export function moneySlip(v?: string | number | null) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

export function weightSlip(kg?: string | null) {
  const n = Number(kg ?? 0);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n < 1) return `${Math.round(n * 1000)} g`;
  return `${n} kg`;
}

export function normalizeCargoPrintTemplate(
  raw?: string | null,
): CargoPrintTemplate {
  const values = Object.values(CargoPrintTemplate) as string[];
  if (raw && values.includes(raw)) return raw as CargoPrintTemplate;
  return CargoPrintTemplate.CLASSIC_GRID;
}

export function cargoViewModel(doc: CargoReceiptDoc) {
  const c = doc.consignment;
  const lh = doc.letterhead;
  const company = lh.companyName || '—';
  const origin = (lh.city || '').trim().toUpperCase() || '—';
  const destination = [c.receiverCity, c.receiverState]
    .filter(Boolean)
    .join(', ')
    .toUpperCase() || '—';
  const service = c.rateSectionId
    ? serviceTypeLabel(c.rateSectionId)
    : '—';
  const payment =
    c.bookingType === BookingType.ACCOUNT ? 'Account / Credit' : 'Cash';
  const title =
    c.bookingType === BookingType.ACCOUNT
      ? 'ACCOUNT CARGO BOOKING'
      : 'CASH CARGO BOOKING';
  const gross = Number(c.grossAmt ?? c.basePrice ?? c.price ?? 0);
  const other = Number(c.otherChargeAmt ?? 0);
  const fuel = Number(c.fuelChargeAmt ?? 0);
  const insuranceAmt = Number(c.insuranceAmt ?? 0);
  const ewayAmt = Number(c.ewayBillAmt ?? 0);
  const insuranceEnabled =
    Boolean(c.insuranceEnabled) || insuranceAmt > 0.001;
  const ewayEnabled = Boolean(c.ewayBillEnabled) || ewayAmt > 0.001;
  const insurance = insuranceEnabled ? insuranceAmt : 0;
  const eway = ewayEnabled ? ewayAmt : 0;
  const cgst = Number(c.cgst ?? 0);
  const sgst = Number(c.sgst ?? 0);
  const igst = Number(c.igst ?? 0);
  const net = Number(c.price ?? 0);

  return {
    c,
    lh,
    company,
    origin,
    destination,
    service,
    payment,
    title,
    phone: lh.phone?.trim() || '',
    pieces: c.numberOfBoxes != null && c.numberOfBoxes > 0 ? String(c.numberOfBoxes) : '—',
    parcelValue: moneySlip(c.parcelValue),
    gross: moneySlip(gross),
    otherLabel: c.otherChargeLabel?.trim() || 'Other charges',
    other: moneySlip(other),
    showOther: other > 0.001 || Boolean(c.otherChargeLabel?.trim()),
    fuel: moneySlip(fuel),
    fuelPct: Number(c.fuelChargePercent ?? 0),
    showFuel: fuel > 0.001 || Number(c.fuelChargePercent ?? 0) > 0,
    insuranceEnabled,
    insurancePct: Number(c.insurancePercent ?? 0),
    insurance: moneySlip(insurance),
    ewayEnabled,
    ewayPct: Number(c.ewayBillPercent ?? 0),
    eway: moneySlip(eway),
    cgst: moneySlip(cgst),
    sgst: moneySlip(sgst),
    igst: moneySlip(igst),
    showTax: cgst + sgst + igst > 0.001,
    net: moneySlip(net),
    remarks: c.remarks?.trim() || '',
    carrier: c.courierCompanyName?.trim() || '—',
  };
}
