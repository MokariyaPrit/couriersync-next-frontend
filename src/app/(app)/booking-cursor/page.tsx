'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { USER_CONFIG_QUERY_KEY, useUserConfig } from '@/lib/auth';
import {
  ACCOUNT_TAB_FIELDS,
  CASH_TAB_FIELDS,
  CARGO_ACCOUNT_TAB_FIELDS,
  CARGO_CASH_TAB_FIELDS,
  defaultBookingTabConfig,
  normalizeBookingTabConfig,
  type BookingTabConfig,
} from '@/lib/booking-tab-config';

function FieldChecklist({
  title,
  fields,
  selected,
  onChange,
}: {
  title: string;
  fields: readonly { key: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (key: string) => {
    if (selectedSet.has(key)) {
      onChange(selected.filter((k) => k !== key));
      return;
    }
    // Keep catalog order when adding
    const nextKeys = fields
      .map((f) => f.key)
      .filter((k) => k === key || selectedSet.has(k));
    onChange(nextKeys);
  };

  const selectAll = () => onChange(fields.map((f) => f.key));
  const clearAll = () => onChange([]);

  return (
    <section className="panel" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            type="button"
            label="Select all"
            size="small"
            outlined
            severity="secondary"
            onClick={selectAll}
          />
          <Button
            type="button"
            label="Clear"
            size="small"
            outlined
            severity="secondary"
            onClick={clearAll}
          />
        </div>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        Only checked fields receive Tab focus on the booking form. Unchecked
        fields are skipped.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.65rem 1rem',
        }}
      >
        {fields.map((f) => (
          <label
            key={f.key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={selectedSet.has(f.key)}
              onChange={() => toggle(f.key)}
            />
            <span>{f.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default function BookingCursorPage() {
  const qc = useQueryClient();
  const { data: userConfig } = useUserConfig();
  const [config, setConfig] = useState<BookingTabConfig>(
    defaultBookingTabConfig(),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setConfig(normalizeBookingTabConfig(userConfig?.bookingTabConfig));
  }, [userConfig?.bookingTabConfig]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const normalized = normalizeBookingTabConfig(config);
      await api.patch('/auth/config', { bookingTabConfig: normalized });
      await qc.invalidateQueries({ queryKey: USER_CONFIG_QUERY_KEY });
      setMessage('Booking cursor saved.');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String(
              (e as { response?: { data?: { message?: string } } }).response
                ?.data?.message ?? 'Failed to save',
            )
          : 'Failed to save';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>Booking cursor</h1>
      <p className="muted" style={{ marginTop: 0, maxWidth: 640 }}>
        Choose which fields Tab should stop on for regular and cargo booking
        forms. Create booking always stays in the Tab order after your selected
        fields.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginTop: '1rem',
        }}
      >
        <FieldChecklist
          title="Account booking"
          fields={ACCOUNT_TAB_FIELDS}
          selected={config.account}
          onChange={(account) => setConfig((p) => ({ ...p, account }))}
        />
        <FieldChecklist
          title="Cash booking"
          fields={CASH_TAB_FIELDS}
          selected={config.cash}
          onChange={(cash) => setConfig((p) => ({ ...p, cash }))}
        />
        <FieldChecklist
          title="Cargo account booking"
          fields={CARGO_ACCOUNT_TAB_FIELDS}
          selected={config.cargoAccount}
          onChange={(cargoAccount) =>
            setConfig((p) => ({ ...p, cargoAccount }))
          }
        />
        <FieldChecklist
          title="Cargo cash booking"
          fields={CARGO_CASH_TAB_FIELDS}
          selected={config.cargoCash}
          onChange={(cargoCash) => setConfig((p) => ({ ...p, cargoCash }))}
        />
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <Button
          label="Save cursor"
          icon="pi pi-check"
          loading={saving}
          onClick={() => void save()}
        />
        {message ? <span className="muted">{message}</span> : null}
        {error ? <span className="error-text">{error}</span> : null}
      </div>
    </div>
  );
}
