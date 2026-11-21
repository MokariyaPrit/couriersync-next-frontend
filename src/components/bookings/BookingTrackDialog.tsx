'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button, Dialog } from '@/components/ui';
import { api, unwrap } from '@/lib/api';
import { apiErrorMessage } from '@/lib/toast';

export type TrackingResult = {
  provider: string;
  documentNumber: string;
  statusText: string | null;
  booking: {
    fromCenter: string | null;
    toCenter: string | null;
    bookedAt: string | null;
    consignee: string | null;
  } | null;
  events: { job: string | null; date: string | null; route: string | null }[];
  officialUrl: string;
  trackedAt: string;
};

type Props = {
  consignmentId: string | null;
  documentNumber?: string | null;
  onHide: () => void;
};

export function BookingTrackDialog({
  consignmentId,
  documentNumber,
  onHide,
}: Props) {
  const open = Boolean(consignmentId);
  const trackQuery = useQuery({
    queryKey: ['booking-track', consignmentId],
    enabled: open,
    retry: false,
    queryFn: async () => {
      const res = await api.get(`/consignments/${consignmentId}/track`);
      return unwrap<TrackingResult>(res.data);
    },
  });

  const data = trackQuery.data;
  const errorMessage = trackQuery.isError
    ? apiErrorMessage(trackQuery.error, 'Failed to fetch live tracking')
    : '';
  const [updatedLabel, setUpdatedLabel] = useState<string | null>(null);
  useEffect(() => {
    if (!data?.trackedAt) {
      setUpdatedLabel(null);
      return;
    }
    setUpdatedLabel(
      new Date(data.trackedAt).toLocaleString('en-IN'),
    );
  }, [data?.trackedAt]);

  return (
    <Dialog
      header={
        documentNumber
          ? `Track · ${documentNumber}`
          : 'Track shipment'
      }
      visible={open}
      onHide={onHide}
      style={{ width: 'min(640px, 96vw)' }}
    >
      {trackQuery.isFetching ? (
        <p className="muted">Fetching live status…</p>
      ) : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {data ? (
        <div className="form-grid">
          <div className="field full">
            <label>Status</label>
            <div style={{ whiteSpace: 'pre-wrap', fontWeight: 600 }}>
              {data.statusText || '—'}
            </div>
          </div>
          <div className="field">
            <label>Document Number</label>
            <div>{data.documentNumber || '—'}</div>
          </div>
          <div className="field">
            <label>Booked</label>
            <div>{data.booking?.bookedAt || '—'}</div>
          </div>
          <div className="field">
            <label>From</label>
            <div>{data.booking?.fromCenter || '—'}</div>
          </div>
          <div className="field">
            <label>To</label>
            <div>{data.booking?.toCenter || '—'}</div>
          </div>
          <div className="field full">
            <label>Consignee</label>
            <div>{data.booking?.consignee || '—'}</div>
          </div>
          {data.events.length ? (
            <div className="field full">
              <label>Scan history</label>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {data.events.map((ev, i) => (
                  <li key={i}>
                    {[ev.job, ev.date, ev.route].filter(Boolean).join(' · ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {updatedLabel ? (
            <div className="field full muted" style={{ fontSize: '0.85rem' }}>
              Updated {updatedLabel}
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Button label="Close" severity="secondary" text onClick={onHide} />
        {data?.officialUrl ? (
          <Button
            label="Open official site"
            icon="pi pi-external-link"
            onClick={() =>
              window.open(data.officialUrl, '_blank', 'noopener,noreferrer')
            }
          />
        ) : null}
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          outlined
          loading={trackQuery.isFetching}
          onClick={() => void trackQuery.refetch()}
        />
      </div>
    </Dialog>
  );
}

/** Show Track when courier company has a trackingProvider. */
export function canTrackBooking(row?: {
  courierCompany?: { trackingProvider?: string | null } | null;
} | null) {
  return Boolean(row?.courierCompany?.trackingProvider?.trim());
}
