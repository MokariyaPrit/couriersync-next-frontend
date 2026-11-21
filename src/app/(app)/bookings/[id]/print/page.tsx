'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select } from '@/components/ui';
import {
  BookingReceiptSlip,
  type BookingReceiptDoc,
} from '@/components/bookings/BookingReceiptSlip';
import { CargoReceiptSlip } from '@/components/bookings/CargoReceiptSlip';
import {
  normalizeCargoPrintTemplate,
  type CargoReceiptDoc,
} from '@/components/bookings/cargo-receipt-shared';
import '@/components/bookings/booking-receipt.css';
import '@/components/bookings/cargo-receipt.css';
import { useParams, useRouter } from 'next/navigation';
import { api, unwrap } from '@/lib/api';
import { useUserConfig } from '@/lib/auth';
import {
  CARGO_PRINT_TEMPLATE_LABELS,
  CargoPrintTemplate,
  ShipmentKind,
} from '@/shared';

const TEMPLATE_OPTIONS = Object.values(CargoPrintTemplate).map((value) => ({
  label: CARGO_PRINT_TEMPLATE_LABELS[value],
  value,
}));

export default function BookingReceiptPrintPage() {
  const params = useParams();
  const router = useRouter();
  const { data: userConfig } = useUserConfig();
  const id = String(params.id || '');
  const preferred = normalizeCargoPrintTemplate(
    userConfig?.cargoPrintTemplate,
  );
  const [templateOverride, setTemplateOverride] =
    useState<CargoPrintTemplate | null>(null);

  const docQuery = useQuery({
    queryKey: ['booking-document', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get(`/consignments/${id}/document`);
      return unwrap<BookingReceiptDoc & CargoReceiptDoc>(res.data);
    },
  });

  const doc = docQuery.data;
  const isCargo = doc?.consignment.shipmentKind === ShipmentKind.CARGO;
  const cargoTemplate = templateOverride ?? preferred;
  const isPortrait =
    isCargo && cargoTemplate === CargoPrintTemplate.COMPACT_PORTRAIT;

  const chromeTitle = useMemo(() => {
    if (!doc) return 'Booking receipt';
    return isCargo ? 'Cargo booking receipt' : 'Booking receipt';
  }, [doc, isCargo]);

  return (
    <div className={isCargo ? 'cr-print-page' : 'br-print-page'}>
      <div
        className={`${isCargo ? 'cr-print-chrome' : 'br-print-chrome'} no-print`}
      >
        <div>
          <h1>{chromeTitle}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {doc?.consignment.awb
              ? `AWB ${doc.consignment.awb}`
              : 'Preview, then print'}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {isCargo ? (
            <Select
              value={cargoTemplate}
              options={TEMPLATE_OPTIONS}
              placeholder="Template"
              style={{ minWidth: 180 }}
              onChange={(e) =>
                setTemplateOverride(
                  normalizeCargoPrintTemplate(String(e.value || '')),
                )
              }
            />
          ) : null}
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            outlined
            severity="secondary"
            onClick={() => router.back()}
          />
          <Button
            label="Print"
            icon="pi pi-print"
            disabled={!doc}
            onClick={() => window.print()}
          />
        </div>
      </div>

      {docQuery.isLoading ? (
        <p className={isCargo ? 'cr-preview-label' : 'br-preview-label'}>
          Loading receipt…
        </p>
      ) : null}
      {docQuery.isError ? (
        <p className={isCargo ? 'cr-preview-label' : 'br-preview-label'}>
          Could not load booking receipt.
        </p>
      ) : null}

      {doc ? (
        isCargo ? (
          <>
            <div className="cr-preview-label no-print">
              Preview — template:{' '}
              {CARGO_PRINT_TEMPLATE_LABELS[cargoTemplate]} (set default in
              Profile)
            </div>
            <div
              className={`cr-preview-frame ${
                isPortrait
                  ? 'cr-preview-frame--portrait'
                  : 'cr-preview-frame--landscape'
              }`}
            >
              <CargoReceiptSlip doc={doc} template={cargoTemplate} />
            </div>
          </>
        ) : (
          <>
            <div className="br-preview-label no-print">
              Preview — this is the slip that prints at the top of A4
            </div>
            <div className="br-preview-scale">
              <BookingReceiptSlip doc={doc} />
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
