import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating } from '@mui/material';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { GuestLayout } from '@/src/components/guest/GuestLayout';
import { FacilityShowcase } from '@/src/components/guest/FacilitySection';
import { EnquiryForm } from '@/src/components/guest/EnquiryForm';
import { ResilientImage } from '@/src/components/guest/ResilientImage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { useI18n } from '@/src/context/I18nContext';
import { api, media } from '@/src/lib/api';
import { defaultReviews, faqGroups, gallery, photos, tourStops } from '@/src/data/resortContent';

function PageHeader({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">{kicker}</p>
      <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
      {lede && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{lede}</p>}
    </div>
  );
}

export function FacilitiesPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        <PageHeader
          kicker="Facilities"
          title="Built for the Katpana desert"
          lede="Warm huts, reliable dining, and practical amenities across the grounds."
        />
        <FacilityShowcase />
      </div>
    </GuestLayout>
  );
}

export function ActivitiesPage() {
  const [items, setItems] = useState<Array<{ image: string; title: string; body: string }>>([
    { image: photos.jeep, title: 'Jeep safari', body: 'A loop through the dunes departing right from your hut. Charges post directly to your room folio.' },
    { image: photos.cloud, title: 'Sandboarding', body: 'Boards are kept at reception. Go out in the crisp morning before the afternoon wind picks up.' },
    { image: photos.night, title: 'Open-air cinema', body: 'Screened after dark when weather permits. Ask the desk at breakfast—no ticket required.' },
    { image: photos.fire, title: 'Bonfire on the sand', body: 'Laid on the dune side after 6 PM. Tell the desk ahead so wood and seating are prepared.' },
    { image: photos.nook, title: 'Window lounge & games', body: 'Board games are available at reception with valley-view seating.' },
    { image: photos.shangrila, title: 'Shangrila excursion', body: 'Lower Kachura day trip arranged via resort jeep with a planned return before dusk.' },
  ]);

  useEffect(() => {
    api<{ activities: Array<{ image: string; title: string; body: string }> }>('/public/site')
      .then((res) => {
        if (res.activities?.length) {
          setItems(res.activities.map((a) => ({ ...a, image: media(a.image) })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <PageHeader
          kicker="Activities"
          title="Desert days & starlit evenings"
          lede="Arrange any activity through reception; charges post neatly to your room folio."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="overflow-hidden">
              {item.image && (
                <div className="h-56">
                  <ResilientImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="p-6">
                <h2 className="font-display text-3xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Cinema</p><p className="font-display mt-1 text-2xl font-semibold">Free</p><p className="text-xs text-muted-foreground mt-1">Weather permitting</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Boards</p><p className="font-display mt-1 text-2xl font-semibold">At desk</p><p className="text-xs text-muted-foreground mt-1">No hire counter</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Jeep</p><p className="font-display mt-1 text-2xl font-semibold">Charged</p><p className="text-xs text-muted-foreground mt-1">Posted to the room</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Court</p><p className="font-display mt-1 text-2xl font-semibold">On site</p><p className="text-xs text-muted-foreground mt-1">Ask for a time</p></CardContent></Card>
        </div>
      </div>
    </GuestLayout>
  );
}

export function GalleryPage() {
  const [active, setActive] = useState<{ src: string; alt: string } | null>(null);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <PageHeader kicker="Gallery" title="Inside Oasis Resort" lede="The dunes, the red-roofed huts, and the kitchen." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map(([src, alt]) => (
            <button
              key={src + alt}
              type="button"
              onClick={() => setActive({ src, alt })}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left cursor-pointer"
            >
              <ResilientImage
                src={src}
                alt={alt}
                loading="lazy"
                className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-56"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Oasis Resort Skardu</DialogTitle>
                <DialogDescription>{active.alt}</DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-border">
                <ResilientImage src={active.src} alt={active.alt} className="max-h-[70vh] w-full object-cover" />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </GuestLayout>
  );
}

export function FaqPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
        <PageHeader kicker="FAQ" title="Before you travel" />
        <div className="space-y-6">
          {faqGroups.map((group) => (
            <Card key={group.title}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{group.title}</h2>
                  <p className="text-xs text-muted-foreground">{group.lede}</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map(([q, a], idx) => (
                    <AccordionItem key={q} value={`${group.title}-${idx}`}>
                      <AccordionTrigger>{q}</AccordionTrigger>
                      <AccordionContent>{a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}

export function DirectionsPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          kicker="Directions"
          title="Fifteen minutes from Skardu Airport"
          lede="Cold desert, Katpana, Skardu 16100. Stays of three nights or more include complimentary airport pickup."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <ResilientImage src={photos.snow} alt="Oasis Resort huts along Katpana road" className="h-80 w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <iframe
              title="Katpana Cold Desert Map"
              className="h-80 w-full border-0"
              src="https://maps.google.com/maps?q=Katpana%20Cold%20Desert%20Skardu&z=12&output=embed"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5 space-y-1"><p className="font-mono text-xs text-accent">01 · Airport</p><h3 className="font-semibold">Land at Skardu</h3><p className="text-sm text-muted-foreground">On stays of 3+ nights, a driver waits with your name. Send your flight number.</p></CardContent></Card>
          <Card><CardContent className="p-5 space-y-1"><p className="font-mono text-xs text-accent">02 · The Road</p><h3 className="font-semibold">Toward Katpana</h3><p className="text-sm text-muted-foreground">Ask for Oasis Resort, Katpana cold desert—not Shangrila Lake.</p></CardContent></Card>
          <Card><CardContent className="p-5 space-y-1"><p className="font-mono text-xs text-accent">03 · Arrival</p><h3 className="font-semibold">The red roofs</h3><p className="text-sm text-muted-foreground">Private parking on site. Check-in is from 2:00 PM at the reception hut.</p></CardContent></Card>
        </div>
        <Button asChild variant="outline">
          <a href="https://maps.google.com/?q=Katpana+Cold+Desert+Skardu" target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
      </div>
    </GuestLayout>
  );
}

export function TourPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <PageHeader
          kicker="Virtual Tour"
          title="Walk the dune side before you arrive"
          lede="Arrival, the hut interiors, morning trays, and evenings on the sand."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {tourStops.map((stop) => (
            <Card key={stop.title} className="overflow-hidden">
              <div className="h-64">
                <ResilientImage src={stop.image} alt={stop.title} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-6 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">{stop.kicker}</p>
                  <h2 className="font-display text-2xl font-semibold mt-0.5">{stop.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{stop.body}</p>
                <ul className="space-y-1 text-xs text-muted-foreground border-t border-border pt-3">
                  {stop.points.map((pt) => (
                    <li key={pt}>· {pt}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Button asChild variant="accent">
            <Link to="/rooms">Explore Available Huts</Link>
          </Button>
        </div>
      </div>
    </GuestLayout>
  );
}

export function ContactPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <PageHeader
          kicker="Contact"
          title="Three numbers, one email."
          lede="0344-5537788 · 0308-1472888 · 0355-4114567 · oasisresortskardu@gmail.com"
        />
        <EnquiryForm topic="Contact" prompt="Send your travel dates, flight details, or group requests." />
      </div>
    </GuestLayout>
  );
}

export function VisitPage() {
  const { t } = useI18n();
  const [hotel, setHotel] = useState<any>(null);
  useEffect(() => {
    api('/public/hotel').then(setHotel).catch(() => {});
  }, []);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-accent">{t.visit}</p>
              <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{t.visitTitle}</h1>
              {hotel?.policies && (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{hotel.policies}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4 space-y-1.5">
                  <MapPin className="h-4 w-4 text-accent" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
                  <p className="text-sm">{hotel?.address || t.address}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-1.5">
                  <Phone className="h-4 w-4 text-accent" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
                  <p className="font-mono text-sm tabular-nums">{hotel?.phone || '0344-5537788'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-1.5">
                  <Mail className="h-4 w-4 text-accent" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="text-sm break-all">{hotel?.email || 'oasisresortskardu@gmail.com'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[t.policy1, t.policy2, t.policy3].map((item) => (
                <Card key={item}>
                  <CardContent className="p-4 text-sm text-foreground">{item}</CardContent>
                </Card>
              ))}
            </div>

            {hotel?.childPolicy && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Children &amp; Extra Bed: </span>
                  {hotel.childPolicy}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <iframe
              title="Oasis Resort Map"
              className="h-[420px] w-full border-0"
              src="https://maps.google.com/maps?q=Katpana%20Cold%20Desert%20Skardu&z=12&output=embed"
            />
          </div>
        </div>

        <EnquiryForm topic="Visit" title="Plan your arrival" />
      </div>
    </GuestLayout>
  );
}

export function ReviewsPage() {
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  useEffect(() => {
    api<any[]>('/public/reviews').then(setLiveReviews).catch(() => {});
  }, []);

  const combined = [
    ...liveReviews.map((r) => ({ name: r.guestName || 'Verified Guest', rating: r.rating || 5, comment: r.comment })),
    ...defaultReviews.map(([name, comment]) => ({ name, rating: 5, comment })),
  ];

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <PageHeader kicker="Guest Reviews" title="From guests who booked direct" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {combined.map((rev, idx) => (
            <Card key={idx}>
              <CardContent className="flex h-full flex-col justify-between p-6 space-y-4">
                <div className="space-y-3">
                  <Rating value={rev.rating} readOnly size="small" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{rev.comment}</p>
                </div>
                <p className="text-xs font-semibold text-foreground">{rev.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}

export function EventsPage() {
  const items = [
    [photos.bonfire, 'Bonfire evenings', 'After dinner, on the dune, if you told the desk by six. Wood and chairs for the number you gave.'],
    [photos.panorama, 'Winter dune stays', 'Heated glass huts with direct winter rates and warm arrival preparation.'],
    [photos.night, 'Open-air cinema', 'Announced at breakfast the same day. Cancelled if the wind is up. The film moves inside or not at all.'],
  ];

  return (
    <GuestLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <PageHeader kicker="Events" title="Nothing here needs a ticket." />
        <div className="space-y-6">
          {items.map(([src, title, body]) => (
            <Card key={title} className="overflow-hidden">
              <div className="grid md:grid-cols-[280px_1fr]">
                <ResilientImage src={src} alt={title} className="h-48 w-full object-cover md:h-full" />
                <CardContent className="p-6">
                  <h2 className="font-display text-3xl font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}
