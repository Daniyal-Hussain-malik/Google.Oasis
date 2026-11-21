import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Drawer } from '@mui/material';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '@/src/pages/admin/AdminLayout';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Separator } from '@/src/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { SUPER, useAdminAuth } from '@/src/context/AdminAuthContext';
import { addDays, adminApi, pkr, pretty, todayISO } from '@/src/lib/api';

const STATUS_TABS = ['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];

export function AdminReservationsPage() {
  const { can } = useAdminAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<any | null>(null);
  const [newModal, setNewModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      if (query.trim()) qs.set('q', query.trim());
      const res = await adminApi<{ items: any[]; total: number }>(`/admin/reservations?${qs.toString()}`);
      setRows(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Could not load reservations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(id: string | number) {
    try {
      const res = await adminApi(`/admin/reservations/${id}`);
      setSelected(res);
    } catch (err: any) {
      toast.error(err.message || 'Could not load reservation');
    }
  }

  return (
    <AdminLayout title="Reservations">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Reservations Ledger</h1>
            <p className="text-sm text-muted-foreground tabular-nums">{total} total records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="accent" size="sm" onClick={() => setNewModal(true)}>
              <Plus className="h-4 w-4" />
              Walk-in / Phone Booking
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="flex-wrap h-auto">
                {STATUS_TABS.map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s === 'all' ? 'All' : s.replaceAll('_', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search booking #, guest, phone..."
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading reservations…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No reservations match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r._id} className="cursor-pointer" onClick={() => openDetail(r._id)}>
                      <TableCell className="font-mono text-xs font-semibold text-accent">{r.bookingNumber}</TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{r.guestName}</p>
                        <p className="text-xs text-muted-foreground">{r.guest?.phone}</p>
                      </TableCell>
                      <TableCell className="text-xs">
                        {pretty(r.checkIn)} — {pretty(r.checkOut)}
                        <span className="block text-muted-foreground">{r.nights} nights</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {(r.rooms || []).map((rm: any) => `${rm.type} #${rm.roomNo}`).join(', ')}
                      </TableCell>
                      <TableCell className="text-xs font-medium capitalize">{r.status.replaceAll('_', ' ')}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {pkr(r.totalAmount + (r.folioTotal || 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                        {pkr(r.balance)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* MUI Slide-over Folio & Action Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 540 } } } }}
      >
        {selected && (
          <ReservationDrawer
            reservation={selected}
            canManage={can(...SUPER)}
            onClose={() => setSelected(null)}
            onUpdated={async () => {
              await openDetail(selected._id);
              await load();
            }}
          />
        )}
      </Drawer>

      {/* New Desk Reservation Dialog */}
      <NewDeskBookingDialog
        open={newModal}
        onClose={() => setNewModal(false)}
        onCreated={() => {
          setNewModal(false);
          load();
        }}
      />
    </AdminLayout>
  );
}

function ReservationDrawer({
  reservation,
  canManage,
  onClose,
  onUpdated,
}: {
  reservation: any;
  canManage: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [payAmount, setPayAmount] = useState(String(Math.max(0, reservation.balance || 0)));
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');
  const [chargeDept, setChargeDept] = useState('service');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPayAmount(String(Math.max(0, reservation.balance || 0)));
  }, [reservation.balance, reservation._id]);

  async function updateStatus(status: string) {
    setBusy(true);
    try {
      await adminApi(`/admin/reservations/${reservation._id}/status`, { method: 'POST', body: { status } });
      toast.success(`Status updated to ${status.replaceAll('_', ' ')}`);
      await onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi(`/admin/reservations/${reservation._id}/payments`, {
        method: 'POST',
        body: { amount: Number(payAmount), method: payMethod, reference: payRef.trim() },
      });
      setPayRef('');
      toast.success('Payment posted to folio');
      await onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Could not post payment');
    } finally {
      setBusy(false);
    }
  }

  async function addCharge(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi(`/admin/reservations/${reservation._id}/folio`, {
        method: 'POST',
        body: { department: chargeDept, description: chargeDesc.trim(), amount: Number(chargeAmt) },
      });
      setChargeDesc('');
      setChargeAmt('');
      toast.success('Folio entry posted');
      await onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Could not post folio entry');
    } finally {
      setBusy(false);
    }
  }

  async function reverseEntry(entryId: number | string) {
    setBusy(true);
    try {
      await adminApi(`/admin/reservations/${reservation._id}/folio/${entryId}/reverse`, {
        method: 'POST',
        body: { reason: 'Reversed by manager' },
      });
      toast.success('Folio entry reversed');
      await onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Reversal failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 space-y-6 bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-accent">{reservation.bookingNumber}</p>
          <h2 className="font-display text-3xl font-semibold">{reservation.guestName}</h2>
          <p className="text-xs text-muted-foreground">
            {reservation.guest?.phone} · {reservation.guest?.email}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Status Controls */}
      <div className="flex flex-wrap gap-2">
        {reservation.status === 'confirmed' && (
          <>
            <Button size="sm" variant="accent" disabled={busy} onClick={() => updateStatus('checked_in')}>
              Check In
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => updateStatus('no_show')}>
              Mark No-Show
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => updateStatus('cancelled')}>
              Cancel Booking
            </Button>
          </>
        )}
        {reservation.status === 'checked_in' && (
          <Button size="sm" variant="accent" disabled={busy} onClick={() => updateStatus('checked_out')}>
            Check Out Guest
          </Button>
        )}
      </div>

      <Separator />

      {/* Summary Numbers */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Room + Extras</p>
          <p className="mt-1 font-mono font-semibold tabular-nums">
            {pkr(reservation.totalAmount + (reservation.folioTotal || 0))}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="mt-1 font-mono font-semibold tabular-nums text-emerald-600">{pkr(reservation.paid)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 font-mono font-semibold tabular-nums text-accent">{pkr(reservation.balance)}</p>
        </div>
      </div>

      {/* Record Payment */}
      <form onSubmit={recordPayment} className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold">Record Payment</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Amount (PKR)</Label>
            <Input type="number" required min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Method</Label>
            <Select value={payMethod} onValueChange={setPayMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="easypaisa">Easypaisa</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Reference / TID (optional)" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
          <Button type="submit" variant="default" size="sm" disabled={busy}>
            Post
          </Button>
        </div>
      </form>

      {/* Add Folio Service / Discount */}
      <form onSubmit={addCharge} className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold">Post Folio Charge / Adjustment</p>
        <div className="grid grid-cols-2 gap-3">
          <Select value={chargeDept} onValueChange={setChargeDept}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Service / Jeep / Laundry</SelectItem>
              {canManage && <SelectItem value="discount">Discount (Credit)</SelectItem>}
              {canManage && <SelectItem value="adjustment">Adjustment</SelectItem>}
            </SelectContent>
          </Select>
          <Input type="number" required min={1} placeholder="Amount PKR" value={chargeAmt} onChange={(e) => setChargeAmt(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Input required placeholder="Description (e.g. Katpana Jeep Safari)" value={chargeDesc} onChange={(e) => setChargeDesc(e.target.value)} />
          <Button type="submit" variant="outline" size="sm" disabled={busy}>
            Add
          </Button>
        </div>
      </form>

      {/* Folio Ledger */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">Folio Charges & Payments</p>
        {!reservation.folio?.length && !reservation.payments?.length ? (
          <p className="text-xs text-muted-foreground">No extra charges or payments posted yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border text-xs">
            {(reservation.folio || []).map((f: any) => (
              <div key={`f-${f.id || f._id}`} className="flex items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium">{f.description}</p>
                  <p className="text-muted-foreground capitalize">{f.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums">
                    {f.kind === 'credit' ? '-' : '+'}
                    {pkr(f.amount)}
                  </span>
                  {canManage && !f.reversedBy && !f.reversalOf && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive" onClick={() => reverseEntry(f.id || f._id)}>
                      Reverse
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(reservation.payments || []).map((p: any, i: number) => (
              <div key={`p-${i}`} className="flex items-center justify-between gap-2 bg-secondary/30 p-3">
                <div>
                  <p className="font-medium capitalize">Payment ({p.method.replaceAll('_', ' ')})</p>
                  {p.reference && <p className="font-mono text-muted-foreground">{p.reference}</p>}
                </div>
                <span className="font-mono font-semibold tabular-nums text-emerald-600">-{pkr(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewDeskBookingDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    checkIn: todayISO(),
    checkOut: addDays(todayISO(), 2),
    adults: 2,
    children: 0,
    rooms: 1,
    roomTypeId: '',
    source: 'desk',
    specialRequests: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    adminApi<any[]>('/admin/room-types')
      .then((res) => {
        setRoomTypes(res);
        if (res[0] && !form.roomTypeId) setForm((p) => ({ ...p, roomTypeId: String(res[0]._id) }));
      })
      .catch(() => {});
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await adminApi('/admin/reservations', {
        method: 'POST',
        body: { ...form, roomTypeId: Number(form.roomTypeId) || form.roomTypeId },
      });
      toast.success('Walk-in / Desk reservation created');
      onCreated();
    } catch (reason: any) {
      setErr(reason.message || 'Could not create booking');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Desk Reservation</DialogTitle>
          <DialogDescription>Book a walk-in, phone, or WhatsApp stay directly into the ledger.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input required value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input required value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Check-in</Label>
              <Input type="date" required value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Check-out</Label>
              <Input type="date" required value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Room Category</Label>
              <Select value={form.roomTypeId} onValueChange={(v) => setForm((p) => ({ ...p, roomTypeId: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt._id} value={String(rt._id)}>
                      {rt.name} ({pkr(rt.baseRate)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm((p) => ({ ...p, source: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desk">Walk-in / Desk</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {err && <Alert severity="error">{err}</Alert>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={busy}>
              {busy ? 'Creating…' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
