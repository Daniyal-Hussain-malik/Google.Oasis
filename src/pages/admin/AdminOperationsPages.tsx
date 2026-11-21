import React, { useCallback, useEffect, useState } from 'react';
import { Rating } from '@mui/material';
import { Check, Plus, RefreshCw, Send, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '@/src/pages/admin/AdminLayout';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Switch } from '@/src/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Textarea } from '@/src/components/ui/textarea';
import { SUPER, useAdminAuth } from '@/src/context/AdminAuthContext';
import { adminApi, adminUploadImage, pkr } from '@/src/lib/api';

export function AdminPaymentProofsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [rejectItem, setRejectItem] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    try {
      const qs = status === 'all' ? '' : `?status=${status}`;
      const res = await adminApi<{ items?: any[] } | any[]>(`/admin/payment-claims${qs}`);
      setClaims(Array.isArray(res) ? res : res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Could not load payment proofs');
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmClaim(id: string | number) {
    try {
      await adminApi(`/admin/payment-claims/${id}/confirm`, { method: 'POST' });
      toast.success('Payment verified and posted to folio');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not confirm payment');
    }
  }

  async function rejectClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectItem) return;
    try {
      await adminApi(`/admin/payment-claims/${rejectItem._id || rejectItem.id}/reject`, {
        method: 'POST',
        body: { reason: rejectReason.trim() || 'Transaction ID could not be matched' },
      });
      setRejectItem(null);
      setRejectReason('');
      toast.success('Payment proof rejected');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not reject');
    }
  }

  return (
    <AdminLayout title="Payment Proofs">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Transfer & Easypaisa Proofs</h1>
            <p className="text-sm text-muted-foreground">Verify bank & wallet Transaction IDs before crediting guest folios.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target</TableHead>
                  <TableHead>Channel & TID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payment proofs in this queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((c) => {
                    const id = c._id || c.id;
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-mono text-xs font-medium">{c.targetLabel || c.bookingNumber || c.orderNumber}</TableCell>
                        <TableCell>
                          <p className="text-xs font-medium capitalize">{c.method?.replaceAll('_', ' ')}</p>
                          <p className="font-mono text-xs text-muted-foreground">{c.reference}</p>
                        </TableCell>
                        <TableCell className="text-xs">{c.senderName || '—'}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">{pkr(c.amount)}</TableCell>
                        <TableCell className="text-xs capitalize">{c.status}</TableCell>
                        <TableCell className="text-right">
                          {c.status === 'pending' ? (
                            <div className="inline-flex gap-1.5">
                              <Button size="sm" variant="accent" onClick={() => confirmClaim(id)}>
                                <Check className="h-3.5 w-3.5" /> Confirm
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setRejectItem(c)}>
                                <X className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{c.rejectReason || 'Processed'}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(rejectItem)} onOpenChange={(o) => !o && setRejectItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment Proof</DialogTitle>
            <DialogDescription>Provide a short reason so the guest can re-submit a corrected TID.</DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectClaim} className="space-y-4">
            <Input required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Amount mismatch or TID not found" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRejectItem(null)}>Cancel</Button>
              <Button type="submit" variant="destructive">Reject Proof</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export function AdminEnquiriesPage() {
  const { can } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi<any[]>('/admin/enquiries')
      .then(setItems)
      .catch((err) => toast.error(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyTarget) return;
    setBusy(true);
    try {
      await adminApi(`/admin/enquiries/${replyTarget._id}/reply`, {
        method: 'POST',
        body: { reply: replyBody.trim() },
      });
      toast.success('Reply sent to guest');
      setReplyTarget(null);
      setReplyBody('');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Reply failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string | number) {
    try {
      await adminApi(`/admin/enquiries/${id}`, { method: 'DELETE' });
      toast.success('Enquiry removed');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AdminLayout title="Enquiries">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Guest Enquiries & Messages</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No enquiries logged yet.</CardContent></Card>
          ) : (
            items.map((item) => (
              <Card key={item._id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-accent">{item.topic} · {item.status}</p>
                      <CardTitle className="text-base">{item.name} ({item.email})</CardTitle>
                      {item.phone && <CardDescription>{item.phone}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setReplyTarget(item)}>
                        <Send className="h-3.5 w-3.5" /> Reply
                      </Button>
                      {can(...SUPER) && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(item._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>{item.message}</p>
                  {item.replyText && (
                    <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground">
                      <span className="font-semibold">Desk Reply:</span> {item.replyText}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={Boolean(replyTarget)} onOpenChange={(o) => !o && setReplyTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.name}</DialogTitle>
            <DialogDescription>{replyTarget?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={sendReply} className="space-y-4">
            <Textarea required rows={5} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write your response from the Oasis Skardu front desk..." />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReplyTarget(null)}>Cancel</Button>
              <Button type="submit" variant="accent" disabled={busy}>{busy ? 'Sending…' : 'Send Reply'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export function AdminFeedbackPage() {
  const { can } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(() => {
    adminApi<any[]>('/admin/feedback').then(setItems).catch((err) => toast.error(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(item: any, published: boolean) {
    try {
      await adminApi(`/admin/feedback/${item._id}`, { method: 'PATCH', body: { published } });
      toast.success(published ? 'Review published to website' : 'Review hidden');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AdminLayout title="Guest Feedback">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold">Guest Ratings & Reviews</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.guestName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{item.bookingNumber}</p>
                  </div>
                  <Rating value={item.rating} readOnly size="small" />
                </div>
                <p className="text-sm text-muted-foreground">{item.comment || 'No written comment'}</p>
                {can(...SUPER) && (
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span>Show on public Reviews page</span>
                    <Switch checked={Boolean(item.published)} onCheckedChange={(v) => togglePublish(item, v)} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminRoomTypesPage() {
  const { can } = useAdminAuth();
  const [types, setTypes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = useCallback(() => {
    adminApi<any[]>('/admin/room-types').then(setTypes).catch((err) => toast.error(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveType(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        bed: editing.bed,
        size: editing.size,
        maxAdults: Number(editing.maxAdults),
        maxChildren: Number(editing.maxChildren),
        baseRate: Number(editing.baseRate),
        weekendRate: Number(editing.weekendRate),
        description: editing.description,
        image: editing.image || '',
        active: editing.active !== false,
      };
      if (editing._id) {
        await adminApi(`/admin/room-types/${editing._id}`, { method: 'PATCH', body: payload });
      } else {
        await adminApi('/admin/room-types', { method: 'POST', body: payload });
      }
      toast.success('Room type saved');
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AdminLayout title="Room Types">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Room Categories & Rates</h1>
          {can(...SUPER) && (
            <Button
              variant="accent"
              size="sm"
              onClick={() =>
                setEditing({ name: '', slug: '', bed: 'King bed', size: '320 sq ft', maxAdults: 2, maxChildren: 2, baseRate: 18000, weekendRate: 21000, description: '', image: '', active: true })
              }
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Bed / Size</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Weekday Rate</TableHead>
                  <TableHead className="text-right">Weekend Rate</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((rt) => (
                  <TableRow key={rt._id}>
                    <TableCell className="font-medium">
                      {rt.name}
                      {rt.active === false && <span className="ml-2 text-xs text-muted-foreground">(Hidden)</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rt.bed} · {rt.size}</TableCell>
                    <TableCell className="text-xs tabular-nums">{rt.maxAdults}A / {rt.maxChildren}C</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">{pkr(rt.baseRate)}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">{pkr(rt.weekendRate)}</TableCell>
                    <TableCell className="text-right">
                      {can(...SUPER) && (
                        <Button size="sm" variant="outline" onClick={() => setEditing({ ...rt })}>Edit</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?._id ? `Edit ${editing.name}` : 'New Room Category'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveType} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Slug</Label><Input required value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div className="space-y-1"><Label>Base Rate (PKR)</Label><Input type="number" required value={editing.baseRate} onChange={(e) => setEditing({ ...editing, baseRate: e.target.value })} /></div>
                <div className="space-y-1"><Label>Weekend Rate (PKR)</Label><Input type="number" required value={editing.weekendRate} onChange={(e) => setEditing({ ...editing, weekendRate: e.target.value })} /></div>
                <div className="space-y-1"><Label>Max Adults</Label><Input type="number" min="1" required value={editing.maxAdults} onChange={(e) => setEditing({ ...editing, maxAdults: e.target.value })} /></div>
                <div className="space-y-1"><Label>Max Children</Label><Input type="number" min="0" required value={editing.maxChildren} onChange={(e) => setEditing({ ...editing, maxChildren: e.target.value })} /></div>
                <div className="space-y-1"><Label>Bed</Label><Input value={editing.bed} onChange={(e) => setEditing({ ...editing, bed: e.target.value })} /></div>
                <div className="space-y-1"><Label>Size</Label><Input value={editing.size} onChange={(e) => setEditing({ ...editing, size: e.target.value })} /></div>
              </div>
              <div className="space-y-1">
                <Label>Room Photo URL or Upload</Label>
                <div className="flex gap-2">
                  <Input value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="/photos/..." />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await adminUploadImage(file);
                          setEditing((prev: any) => ({ ...prev, image: res.url }));
                          toast.success('Room photo uploaded');
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="flex items-center justify-between pt-1">
                <Label>Visible on Public Website</Label>
                <Switch checked={editing.active !== false} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" variant="accent">Save Category</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export function AdminRoomsPage() {
  const { can } = useAdminAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [newNo, setNewNo] = useState('');
  const [newType, setNewType] = useState('');

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([adminApi<any[]>('/admin/rooms'), adminApi<any[]>('/admin/room-types')]);
    setRooms(r);
    setTypes(t);
    if (t[0] && !newType) setNewType(String(t[0]._id));
  }, [newType]);

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleStatus(room: any, status: string) {
    try {
      await adminApi(`/admin/rooms/${room._id}`, { method: 'PATCH', body: { status } });
      toast.success(`Room ${room.roomNo} marked ${status}`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminApi('/admin/rooms', { method: 'POST', body: { roomNo: newNo.trim(), roomType: Number(newType) || newType } });
      setNewNo('');
      toast.success('Room added');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AdminLayout title="Rooms Inventory">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold">Huts & Rooms Inventory</h1>
          {can(...SUPER) && (
            <form onSubmit={addRoom} className="flex items-center gap-2">
              <Input className="w-28" required placeholder="Room #" value={newNo} onChange={(e) => setNewNo(e.target.value)} />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t._id} value={String(t._id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" variant="accent" size="sm">Add Room</Button>
            </form>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono font-semibold">{r.roomNo}</TableCell>
                    <TableCell>{r.roomType?.name || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.notes || '—'}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => toggleStatus(r, v)}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
