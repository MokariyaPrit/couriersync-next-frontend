'use client';

import { CargoPrintTemplate } from '@/shared';
import { mediaUrl } from '@/lib/media-url';
import {
  cargoViewModel,
  formatSlipDate,
  weightSlip,
  type CargoReceiptDoc,
} from './cargo-receipt-shared';

function Logo({
  company,
  logoUrl,
  className,
  plate,
}: {
  company: string;
  logoUrl?: string | null;
  className?: string;
  /** Light plate behind logo (for dark headers) so colors stay visible */
  plate?: boolean;
}) {
  const src = mediaUrl(logoUrl);
  const img = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className || 'cr-logo'} src={src} alt={company} />
  ) : (
    <div className={`${className || 'cr-logo'} cr-logo-fallback`}>{company}</div>
  );
  if (plate) {
    return <div className="cr-logo-plate">{img}</div>;
  }
  return img;
}

function ChargesRows({
  v,
}: {
  v: ReturnType<typeof cargoViewModel>;
}) {
  return (
    <>
      <div className="cr-charge-row">
        <span>Gross amount</span>
        <strong>{v.gross}</strong>
      </div>
      {v.showOther ? (
        <div className="cr-charge-row">
          <span>{v.otherLabel}</span>
          <strong>{v.other}</strong>
        </div>
      ) : null}
      {v.showFuel ? (
        <div className="cr-charge-row">
          <span>
            Fuel charge
            {v.fuelPct > 0 ? ` (${v.fuelPct}%)` : ''}
          </span>
          <strong>{v.fuel}</strong>
        </div>
      ) : null}
      {v.insuranceEnabled ? (
        <div className="cr-charge-row">
          <span>
            Insurance
            {v.insurancePct > 0 ? ` (${v.insurancePct}%)` : ''}
          </span>
          <strong>{v.insurance}</strong>
        </div>
      ) : null}
      {v.ewayEnabled ? (
        <div className="cr-charge-row">
          <span>
            E-WayBill
            {v.ewayPct > 0 ? ` (${v.ewayPct}%)` : ''}
          </span>
          <strong>{v.eway}</strong>
        </div>
      ) : null}
      {v.showTax ? (
        <>
          {Number(v.cgst) > 0 ? (
            <div className="cr-charge-row">
              <span>CGST</span>
              <strong>{v.cgst}</strong>
            </div>
          ) : null}
          {Number(v.sgst) > 0 ? (
            <div className="cr-charge-row">
              <span>SGST</span>
              <strong>{v.sgst}</strong>
            </div>
          ) : null}
          {Number(v.igst) > 0 ? (
            <div className="cr-charge-row">
              <span>IGST</span>
              <strong>{v.igst}</strong>
            </div>
          ) : null}
        </>
      ) : null}
      <div className="cr-charge-row cr-charge-net">
        <span>Net amount</span>
        <strong>{v.net}</strong>
      </div>
    </>
  );
}

function ClassicGrid({ doc }: { doc: CargoReceiptDoc }) {
  const v = cargoViewModel(doc);
  return (
    <div className="cr-sheet cr-classic">
      <header className="cr-classic-head">
        <div className="cr-classic-brand">
          <Logo
            company={v.company}
            logoUrl={v.lh.logoUrl}
            className="cr-logo cr-logo--classic"
          />
          <div>
            <strong>{v.company}</strong>
            {v.lh.gstin ? <span>GSTIN {v.lh.gstin}</span> : null}
            {v.phone ? <span>Mo. {v.phone}</span> : null}
          </div>
        </div>
        <div className="cr-classic-route">
          <div>
            <span className="cr-lbl">Origin</span>
            <strong>{v.origin}</strong>
          </div>
          <div>
            <span className="cr-lbl">Destination</span>
            <strong>{v.destination}</strong>
          </div>
        </div>
        <div className="cr-classic-meta">
          <span className="cr-badge">{v.title}</span>
          <div>
            <span className="cr-lbl">Consignment no.</span>
            <strong className="cr-awb">{v.c.awb}</strong>
          </div>
          <div>
            <span className="cr-lbl">Date</span>
            <strong>{formatSlipDate(v.c.bookingDate)}</strong>
          </div>
        </div>
      </header>

      <div className="cr-classic-parties">
        <section>
          <h3>Consignor</h3>
          <p>
            <strong>{v.c.senderName}</strong>
            {v.c.senderAddress ? `\n${v.c.senderAddress}` : ''}
            {v.c.senderPhone ? `\nMo. ${v.c.senderPhone}` : ''}
          </p>
        </section>
        <section>
          <h3>Consignee</h3>
          <p>
            <strong>{v.c.receiverName}</strong>
            {v.c.receiverAddress ? `\n${v.c.receiverAddress}` : ''}
            {v.c.receiverPhone ? `\nMo. ${v.c.receiverPhone}` : ''}
          </p>
        </section>
      </div>

      <table className="cr-classic-ship">
        <thead>
          <tr>
            <th>Package</th>
            <th>Pieces</th>
            <th>Carrier</th>
            <th>Weight</th>
            <th>Payment</th>
            <th>Parcel value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{v.service}</td>
            <td>{v.pieces}</td>
            <td>{v.carrier}</td>
            <td>{weightSlip(v.c.weightKg)}</td>
            <td>{v.payment}</td>
            <td>{v.parcelValue}</td>
          </tr>
        </tbody>
      </table>

      <div className="cr-classic-bottom">
        <div className="cr-classic-terms">
          <h4>Terms &amp; conditions</h4>
          <p>
            Subject to standard cargo booking terms. Restricted items not
            accepted. Declared details are true to the best of sender&apos;s
            knowledge.
          </p>
          {v.remarks ? <p className="cr-remarks">Remarks: {v.remarks}</p> : null}
        </div>
        <div className="cr-charges-box">
          <ChargesRows v={v} />
        </div>
        <div className="cr-classic-signs">
          <div>
            <span>Consignee sign &amp; stamp</span>
          </div>
          <div>
            <span>Received by</span>
            <strong>{v.company}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoldBands({ doc }: { doc: CargoReceiptDoc }) {
  const v = cargoViewModel(doc);
  return (
    <div className="cr-sheet cr-bands">
      <header className="cr-bands-top">
        <div className="cr-bands-brand">
          <Logo
            company={v.company}
            logoUrl={v.lh.logoUrl}
            className="cr-logo cr-logo--bands"
            plate
          />
          <strong>{v.company}</strong>
        </div>
        <span className="cr-bands-title">{v.title}</span>
      </header>
      <div className="cr-bands-route">
        <div>
          <span className="cr-lbl">Origin</span>
          <strong>{v.origin}</strong>
        </div>
        <div className="cr-bands-arrow" aria-hidden>
          →
        </div>
        <div>
          <span className="cr-lbl">Destination</span>
          <strong>{v.destination}</strong>
        </div>
        <div className="cr-bands-awb">
          <span className="cr-lbl">Consignment</span>
          <strong>{v.c.awb}</strong>
          <span>{formatSlipDate(v.c.bookingDate)}</span>
        </div>
      </div>
      <div className="cr-bands-body">
        <div className="cr-bands-cards">
          <section>
            <h3>Sender</h3>
            <p>
              <strong>{v.c.senderName}</strong>
              {v.c.senderPhone ? `\n${v.c.senderPhone}` : ''}
              {v.c.senderAddress ? `\n${v.c.senderAddress}` : ''}
            </p>
          </section>
          <section>
            <h3>Receiver</h3>
            <p>
              <strong>{v.c.receiverName}</strong>
              {v.c.receiverPhone ? `\n${v.c.receiverPhone}` : ''}
              {v.c.receiverAddress ? `\n${v.c.receiverAddress}` : ''}
            </p>
          </section>
        </div>
        <div className="cr-bands-facts">
          <div>
            <span className="cr-lbl">Pieces</span>
            <strong>{v.pieces}</strong>
          </div>
          <div>
            <span className="cr-lbl">Weight</span>
            <strong>{weightSlip(v.c.weightKg)}</strong>
          </div>
          <div>
            <span className="cr-lbl">Carrier</span>
            <strong>{v.carrier}</strong>
          </div>
          <div>
            <span className="cr-lbl">Service</span>
            <strong>{v.service}</strong>
          </div>
          <div>
            <span className="cr-lbl">Parcel value</span>
            <strong>{v.parcelValue}</strong>
          </div>
          <div>
            <span className="cr-lbl">Payment</span>
            <strong>{v.payment}</strong>
          </div>
        </div>
        <div className="cr-bands-money">
          <ChargesRows v={v} />
        </div>
      </div>
      <footer className="cr-bands-foot">
        <span>Sender signature</span>
        <span>Receiver signature</span>
        <span>Received by {v.company}</span>
      </footer>
    </div>
  );
}

function CompactPortrait({ doc }: { doc: CargoReceiptDoc }) {
  const v = cargoViewModel(doc);
  return (
    <div className="cr-sheet cr-compact">
      <header className="cr-compact-head">
        <Logo
          company={v.company}
          logoUrl={v.lh.logoUrl}
          className="cr-logo cr-logo--compact"
        />
        <div>
          <strong>{v.company}</strong>
          <span>{v.title}</span>
          {v.lh.gstin ? <span>GSTIN {v.lh.gstin}</span> : null}
        </div>
      </header>
      <div className="cr-compact-awb">
        <strong>{v.c.awb}</strong>
        <span>{formatSlipDate(v.c.bookingDate)}</span>
      </div>
      <div className="cr-compact-route">
        <div>
          <span className="cr-lbl">Origin</span>
          <strong>{v.origin}</strong>
        </div>
        <div>
          <span className="cr-lbl">Destination</span>
          <strong>{v.destination}</strong>
        </div>
      </div>
      <section className="cr-compact-party">
        <h3>Sender</h3>
        <p>
          {v.c.senderName}
          {v.c.senderPhone ? ` · ${v.c.senderPhone}` : ''}
          {v.c.senderAddress ? `\n${v.c.senderAddress}` : ''}
        </p>
      </section>
      <section className="cr-compact-party">
        <h3>Receiver</h3>
        <p>
          {v.c.receiverName}
          {v.c.receiverPhone ? ` · ${v.c.receiverPhone}` : ''}
          {v.c.receiverAddress ? `\n${v.c.receiverAddress}` : ''}
        </p>
      </section>
      <div className="cr-compact-chips">
        <span>{v.pieces} pcs</span>
        <span>{weightSlip(v.c.weightKg)}</span>
        <span>{v.carrier}</span>
        <span>PV {v.parcelValue}</span>
        <span>{v.payment}</span>
      </div>
      <div className="cr-charges-box cr-compact-charges">
        <ChargesRows v={v} />
      </div>
      <footer className="cr-compact-foot">
        <span>Signature ________________</span>
        <span>{v.company}</span>
      </footer>
    </div>
  );
}

function Ledger({ doc }: { doc: CargoReceiptDoc }) {
  const v = cargoViewModel(doc);
  return (
    <div className="cr-sheet cr-ledger">
      <div className="cr-ledger-main">
        <header className="cr-ledger-head">
          <Logo
            company={v.company}
            logoUrl={v.lh.logoUrl}
            className="cr-logo cr-logo--ledger"
          />
          <div>
            <strong>{v.company}</strong>
            <span>{v.title}</span>
            {v.lh.gstin ? <span>GSTIN {v.lh.gstin}</span> : null}
            {v.phone ? <span>Mo. {v.phone}</span> : null}
          </div>
          <div className="cr-ledger-awb">
            <span className="cr-lbl">Consignment</span>
            <strong>{v.c.awb}</strong>
            <span>{formatSlipDate(v.c.bookingDate)}</span>
          </div>
        </header>
        <div className="cr-ledger-route">
          <div>
            <span className="cr-lbl">Origin</span>
            <strong>{v.origin}</strong>
          </div>
          <div>
            <span className="cr-lbl">Destination</span>
            <strong>{v.destination}</strong>
          </div>
        </div>
        <div className="cr-classic-parties cr-ledger-parties">
          <section>
            <h3>Consignor</h3>
            <p>
              <strong>{v.c.senderName}</strong>
              {v.c.senderAddress ? `\n${v.c.senderAddress}` : ''}
              {v.c.senderPhone ? `\n${v.c.senderPhone}` : ''}
            </p>
          </section>
          <section>
            <h3>Consignee</h3>
            <p>
              <strong>{v.c.receiverName}</strong>
              {v.c.receiverAddress ? `\n${v.c.receiverAddress}` : ''}
              {v.c.receiverPhone ? `\n${v.c.receiverPhone}` : ''}
            </p>
          </section>
        </div>
        <table className="cr-classic-ship">
          <thead>
            <tr>
              <th>Service</th>
              <th>Pieces</th>
              <th>Carrier</th>
              <th>Weight</th>
              <th>Parcel value</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{v.service}</td>
              <td>{v.pieces}</td>
              <td>{v.carrier}</td>
              <td>{weightSlip(v.c.weightKg)}</td>
              <td>{v.parcelValue}</td>
              <td>{v.payment}</td>
            </tr>
          </tbody>
        </table>
        {v.remarks ? <p className="cr-remarks">Remarks: {v.remarks}</p> : null}
        <div className="cr-ledger-signs">
          <span>Sender sign</span>
          <span>Consignee sign</span>
          <span>Received by {v.company}</span>
        </div>
      </div>
      <aside className="cr-ledger-side">
        <h3>Charges</h3>
        <ChargesRows v={v} />
      </aside>
    </div>
  );
}

export function CargoReceiptSlip({
  doc,
  template,
}: {
  doc: CargoReceiptDoc;
  template: CargoPrintTemplate;
}) {
  switch (template) {
    case CargoPrintTemplate.BOLD_BANDS:
      return <BoldBands doc={doc} />;
    case CargoPrintTemplate.COMPACT_PORTRAIT:
      return <CompactPortrait doc={doc} />;
    case CargoPrintTemplate.LEDGER:
      return <Ledger doc={doc} />;
    case CargoPrintTemplate.CLASSIC_GRID:
    default:
      return <ClassicGrid doc={doc} />;
  }
}
