'use client';

import { BookingType, ShipmentKind } from '@/shared';
import { Suspense } from 'react';
import { BookingsPageView } from '@/components/bookings/BookingsPageView';

export default function CargoAccountBookingsPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <BookingsPageView
        mode={BookingType.ACCOUNT}
        shipmentKind={ShipmentKind.CARGO}
      />
    </Suspense>
  );
}
