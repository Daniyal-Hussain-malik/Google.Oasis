import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, LinearProgress, Skeleton } from '@mui/material';
import { MoonStar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '@/src/pages/admin/AdminLayout';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { SUPER, useAdminAuth } from '@/src/context/AdminAuthContext';
import { adminApi, pkr, pretty } from '@/src/lib/api';

export function AdminDashboardPage() {
  const { can } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [occ, setOcc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditing, setAuditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [d, o] = await Promise.all([
        adminApi('/admin/dashboard'),
        adminApi('/admin/occupancy?days=30'),
      ]);
      setData(d);
      setOcc(o);
    } catch (err: any) {
      setError(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function quickStatus(id: string | number, status: 'checked_in' | 'checked_out') {
    try {
      await adminApi(`/admin/reservations/${id}/status`, { method: 'POST', body: { status } });
      toast.success(status === 'checked_in' ? 'Guest checked in' : 'Guest checked out');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Action blocked');
    }
  }

  async function runNightAudit() {
    setAuditing(true);
    try {
      const res = await adminApi<{ count?: number }>('/admin/reservations/night-audit', { method: 'POST' });
      toast.success(`Night audit complete (${res.count ?? 0} processed)`);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Night audit failed');
    } finally {
      setAuditing(false);
    }
  }

  return (
    <AdminLayout title="Front Desk Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Morning Desk</h1>
            <p className="text-sm text-muted-foreground">
              Business Date: <span className="font-mono font-medium text-foreground">{data?.businessDate || '—'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {can(...SUPER) && (
              <Button variant="outline" size="sm" disabled={auditing} onClick={runNightAudit}>
                <MoonStar className="h-4 w-4" />
                {auditing ? 'Running Audit…' : 'Night Audit'}
              </Button>
            )}
            <Button asChild variant="accent" size="sm">
              <Link to="/admin/reservations">Manage Reservations</Link>
            </Button>
          </div>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} variant="rounded" height={110} />
            ))}
          </div>
        ) : data ? (
          <>
            {/* KPI Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Occupancy Tonight</CardDescription>
                  <CardTitle className="font-mono text-3xl tabular-nums">{data.occupancy}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <LinearProgress variant="determinate" value={data.occupancy} color="secondary" className="rounded-full" />
                  <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
                    {data.soldTonight} / {data.rooms} rooms sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In-House Stays</CardDescription>
                  <CardTitle className="font-mono text-3xl tabular-nums">{data.inHouse}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Currently checked in</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Expected Arrivals</CardDescription>
                  <CardTitle className="font-mono text-3xl tabular-nums">{data.arrivals?.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Arriving today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Departures Due</CardDescription>
                  <CardTitle className="font-mono text-3xl tabular-nums">{data.departures?.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Checking out today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Open Enquiries</CardDescription>
                  <CardTitle className="font-mono text-3xl tabular-nums text-accent">{data.newEnquiries}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/admin/enquiries" className="text-xs font-medium text-accent hover:underline">
                    {data.arrivalsNext7Days} arrivals next 7d →
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Today's Arrivals & Departures */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today’s Arrivals</CardTitle>
                  <CardDescription>Confirmed reservations checking in on {pretty(data.businessDate)}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {data.arrivals?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.arrivals.map((r: any) => (
                          <TableRow key={r._id}>
                            <TableCell className="font-mono text-xs">{r.bookingNumber}</TableCell>
                            <TableCell className="font-medium">{r.guestName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {(r.rooms || []).map((rm: any) => rm.roomNo).join(', ')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="accent" onClick={() => quickStatus(r._id, 'checked_in')}>
                                Check In
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="p-6 text-sm text-muted-foreground">No pending arrivals remaining today.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today’s Departures</CardTitle>
                  <CardDescription>In-house guests scheduled to check out today</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {data.departures?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.departures.map((r: any) => (
                          <TableRow key={r._id}>
                            <TableCell className="font-mono text-xs">{r.bookingNumber}</TableCell>
                            <TableCell className="font-medium">{r.guestName}</TableCell>
                            <TableCell className="font-mono text-xs tabular-nums">{pkr(r.balance)}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => quickStatus(r._id, 'checked_out')}>
                                Check Out
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="p-6 text-sm text-muted-foreground">No scheduled departures today.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 30-Day Occupancy & Revenue Chart */}
            {occ?.series?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">30-Day Occupancy & Room Revenue Forecast</CardTitle>
                  <CardDescription>Bar height represents occupancy percentage; hover any bar for nightly revenue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-end gap-1 pt-4">
                    {occ.series.map((day: any) => (
                      <div
                        key={day.date}
                        title={`${pretty(day.date)} · ${day.sold}/${day.rooms} rooms (${day.occupancy}%) · ${pkr(day.revenue)}`}
                        className="group relative flex-1 flex flex-col justify-end h-full"
                      >
                        <div
                          className="w-full rounded-t bg-accent/80 transition-colors group-hover:bg-accent"
                          style={{ height: `${Math.max(day.occupancy, 4)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>{pretty(occ.series[0]?.date)}</span>
                    <span>Total 30d Revenue: {pkr(occ.series.reduce((s: number, d: any) => s + d.revenue, 0))}</span>
                    <span>{pretty(occ.series.at(-1)?.date)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
