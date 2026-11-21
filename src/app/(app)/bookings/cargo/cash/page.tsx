'use client';

import { BookingType, ShipmentKind } from '@/shared';
import { Suspense } from 'react';
import { BookingsPageView } from '@/components/bookings/BookingsPageView';

export default function CargoCashBookingsPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <BookingsPageView
        mode={BookingType.CASH}
        shipmentKind={ShipmentKind.CARGO}
      />
    </Suspense>
  );
}
