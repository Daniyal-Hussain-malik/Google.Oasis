import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating } from '@mui/material';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { GuestLayout } from '@/src/components/guest/GuestLayout';
import { FacilityShowcase } from '@/src/components/guest/FacilitySection';
import { EnquiryForm } from '@/src/components/guest/EnquiryForm';
import { ResilientImage } from '@/src/components/guest/ResilientImage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { api, media } from '@/src/lib/api';
import { defaultReviews, faqs, gallery, photos } from '@/src/data/resortContent';

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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
      </div>
    </GuestLayout>
  );
}

export function GalleryPage() {
  const [active, setActive] = useState<{ src: string; alt: string } | null>(null);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader kicker="Gallery" title="Inside Oasis Resort" lede="The dunes, the red-roofed huts, and the kitchen." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map(([src, alt]) => (
            <button
              key={src}
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PageHeader kicker="FAQ" title="Before you travel" />
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map(([q, a], idx) => (
                <AccordionItem key={q} value={`faq-${idx}`}>
                  <AccordionTrigger>{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}

export function DirectionsPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
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
  const stops = [
    [photos.row, 'Arrival along the red-roofed row. Check-in opens at 2:00 PM.'],
    [photos.deluxeDay, 'Deluxe rooms face the desert ridge with carved wood beds and breakfast included.'],
    [photos.nook, 'Afternoon tea at the valley-facing window nook.'],
    [photos.breakfast, 'Fresh breakfast tray delivered directly to your hut.'],
    [photos.bonfire, 'Evening bonfire and dinner service on calm nights.'],
    [photos.wide, 'In winter, snow blankets the dunes right outside your glass terrace.'],
  ];

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          kicker="Virtual Tour"
          title="Walk the dune side before you arrive"
          lede="Arrival, the hut interiors, morning trays, and evenings on the sand."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {stops.map(([src, caption]) => (
            <Card key={caption} className="overflow-hidden">
              <div className="h-64">
                <ResilientImage src={src} alt={caption} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
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
          title="Speak directly with the resort desk"
          lede="0344-5537788 · 0355-4114567 · oasisresortskardu@gmail.com"
        />
        <EnquiryForm topic="Contact" prompt="Send your travel dates, flight details, or group requests." />
      </div>
    </GuestLayout>
  );
}

export function VisitPage() {
  const [hotel, setHotel] = useState<any>(null);
  useEffect(() => {
    api('/public/hotel').then(setHotel).catch(() => {});
  }, []);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <PageHeader kicker="Visit" title="Come to Katpana" lede={hotel?.address || 'Cold desert, Katpana, Skardu 16100'} />
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 space-y-2">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Address</h2>
              <p className="text-sm text-muted-foreground">{hotel?.address || 'Cold desert, Katpana, Skardu 16100, Gilgit-Baltistan'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <Phone className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Desk Phones</h2>
              <p className="font-mono text-sm text-muted-foreground tabular-nums">
                {(hotel?.phones || ['0344-5537788', '0355-4114567']).join(' · ')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Email</h2>
              <p className="text-sm text-muted-foreground">{hotel?.email || 'oasisresortskardu@gmail.com'}</p>
            </CardContent>
          </Card>
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader kicker="Guest Reviews" title="From guests who booked direct" />
        <div className="grid gap-6 md:grid-cols-3">
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
    [photos.bonfire, 'Bonfire evenings', 'Lit on calm nights after dinner. Request at reception by 6:00 PM.'],
    [photos.panorama, 'Winter dune stays', 'Heated glass huts with direct winter rates and warm arrival preparation.'],
    [photos.night, 'Open-air cinema', 'Announced at breakfast on clear nights with zero extra charge.'],
  ];

  return (
    <GuestLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <PageHeader kicker="Events" title="Evenings & seasonal gatherings" />
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
