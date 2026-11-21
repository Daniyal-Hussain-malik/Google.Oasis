import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import { ArrowLeft, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { GuestLayout } from '@/src/components/guest/GuestLayout';
import { EnquiryForm } from '@/src/components/guest/EnquiryForm';
import { ResilientImage } from '@/src/components/guest/ResilientImage';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { api, media, pkr } from '@/src/lib/api';
import {
  EditorialItem,
  experiences,
  journals,
  offers,
  photos,
  places,
  policies,
  restaurants,
  wellness,
} from '@/src/data/resortContent';

const KIND_MAP: Record<string, { kicker: string; title: string; lede: string; items: EditorialItem[]; basePath: string }> = {
  places: {
    kicker: 'Around Skardu',
    title: 'Katpana & nearby excursions',
    lede: 'The cold desert right outside your door, and day trips arranged from reception.',
    items: places,
    basePath: '/around',
  },
  experiences: {
    kicker: 'Experiences',
    title: 'Life at the resort',
    lede: 'Mornings by the valley window, afternoon jeep safaris, and fires on the sand.',
    items: experiences,
    basePath: '/experiences',
  },
  offers: {
    kicker: 'Direct Offers',
    title: 'Seasonal rates & privileges',
    lede: 'Book directly on our site and mention any offer in your reservation notes.',
    items: offers,
    basePath: '/offers',
  },
  restaurants: {
    kicker: 'Dining',
    title: 'One kitchen, on the dune',
    lede: 'Complimentary breakfast every morning, plus freshly cooked karahi, daal, and valley trout.',
    items: restaurants,
    basePath: '/dining',
  },
  journals: {
    kicker: 'Resort Journal',
    title: 'Notes from Katpana',
    lede: 'Stories from the grounds, seasonal weather notes, and guest journals.',
    items: journals,
    basePath: '/blog',
  },
};

export function IndexPage({ kind }: { kind: keyof typeof KIND_MAP }) {
  const meta = KIND_MAP[kind];
  const [items, setItems] = useState<EditorialItem[]>(meta.items);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    if (kind === 'experiences') {
      api<{ experiences: EditorialItem[] }>('/public/site')
        .then((site) => {
          if (site.experiences?.length) setItems(site.experiences.map((e) => ({ ...e, image: media(e.image) })));
        })
        .catch(() => {});
    } else if (kind === 'journals') {
      api<any[]>('/public/blog')
        .then((posts) => {
          const mapped: EditorialItem[] = posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            kicker: p.authorName || 'Journal',
            image: media(p.image) || photos.wide,
            summary: p.excerpt,
            body: p.body,
            authorName: p.authorName,
            publishedAt: p.publishedAt,
          }));
          setItems([...mapped, ...journals]);
        })
        .catch(() => {});
    } else if (kind === 'restaurants') {
      api<any[]>('/public/menu').then(setMenuItems).catch(() => {});
    }
  }, [kind]);

  return (
    <GuestLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{meta.kicker}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{meta.title}</h1>
          <p className="mt-3 text-base text-muted-foreground">{meta.lede}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.slug} className="overflow-hidden flex flex-col justify-between hover:border-accent/50 transition-colors">
              <div>
                <div className="h-52">
                  <ResilientImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <CardContent className="p-6 space-y-2">
                  <p className="text-xs text-muted-foreground">{item.kicker}</p>
                  <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                </CardContent>
              </div>
              <div className="px-6 pb-6 flex items-center justify-between">
                <Link to={`${meta.basePath}/${item.slug}`} className="text-sm font-medium text-accent hover:underline">
                  Read more →
                </Link>
                {item.book && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/book?offer=${encodeURIComponent(item.title)}`}>Book with offer</Link>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {kind === 'restaurants' && menuItems.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-semibold">Today’s Kitchen Menu</h2>
                <p className="text-sm text-muted-foreground">Order directly from your room once checked in.</p>
              </div>
              <Button asChild variant="accent" size="sm">
                <Link to="/order">Order Food</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {menuItems.map((dish) => (
                <Card key={dish._id}>
                  <CardContent className="p-4 space-y-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold">{dish.name}</p>
                      <span className="font-mono text-xs font-semibold tabular-nums text-accent">{pkr(dish.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{dish.category}</p>
                    <p className="text-xs text-muted-foreground pt-1">{dish.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {kind === 'journals' && <GuestJournalComposer />}
      </div>
    </GuestLayout>
  );
}

function GuestJournalComposer() {
  const [bookingNumber, setBookingNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      await api('/public/blog/submit', {
        method: 'POST',
        body: { bookingNumber: bookingNumber.trim().toUpperCase(), phone: phone.trim(), title, body },
      });
      setTitle('');
      setBody('');
      setMsg('Story submitted for review. Once approved by our desk, it appears in the journal.');
      toast.success('Journal story submitted');
    } catch (reason: any) {
      setErr(reason.message || 'Could not submit post');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-2xl">
          <PenLine className="h-5 w-5 text-accent" />
          Share a story from your stay
        </CardTitle>
        <CardDescription>Checked-out guests can publish travel notes using their booking number and phone.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitPost} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Booking Number</Label>
              <Input required value={bookingNumber} onChange={(e) => setBookingNumber(e.target.value)} placeholder="OAS-..." />
            </div>
            <div className="space-y-1.5">
              <Label>Phone on Stay</Label>
              <Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input required minLength={5} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunrise over the frozen dune" />
          </div>
          <div className="space-y-1.5">
            <Label>Your Story (minimum 100 characters)</Label>
            <Textarea required minLength={100} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {err && <Alert severity="error">{err}</Alert>}
          {msg && <Alert severity="success">{msg}</Alert>}
          <Button type="submit" variant="accent" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function DetailPage({ kind }: { kind: keyof typeof KIND_MAP }) {
  const { slug } = useParams();
  const meta = KIND_MAP[kind];
  const [item, setItem] = useState<EditorialItem | null>(
    () => meta.items.find((i) => i.slug === slug) || null,
  );

  useEffect(() => {
    const localHit = meta.items.find((i) => i.slug === slug);
    if (localHit) {
      setItem(localHit);
      return;
    }
    if (kind === 'journals' && slug) {
      api<any>(`/public/blog/${slug}`)
        .then((p) =>
          setItem({
            slug: p.slug,
            title: p.title,
            kicker: p.authorName || 'Journal',
            image: media(p.image) || photos.wide,
            summary: p.excerpt,
            body: p.body,
          }),
        )
        .catch(() => setItem(null));
    }
  }, [kind, slug, meta.items]);

  if (!item) {
    return (
      <GuestLayout>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="font-display text-4xl font-semibold">Story not found</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to={meta.basePath}>Back to {meta.kicker}</Link>
          </Button>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-6">
        <Link to={meta.basePath} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {meta.kicker}
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{item.kicker}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{item.title}</h1>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <ResilientImage src={item.image} alt={item.title} className="max-h-[460px] w-full object-cover" />
        </div>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
          {item.body}
        </div>
        {item.book && (
          <div className="pt-4">
            <Button asChild variant="accent" size="lg">
              <Link to={`/book?offer=${encodeURIComponent(item.title)}`}>Reserve with this offer</Link>
            </Button>
          </div>
        )}
      </article>
    </GuestLayout>
  );
}

export function AboutPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">The Resort</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">Oasis Resort Skardu</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Set on 165 kanals at the edge of the Katpana cold desert, Oasis Resort offers nineteen heated glass-fronted huts fifteen minutes from Skardu Airport.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <ResilientImage src={photos.wide} alt="Oasis Resort Skardu huts" className="h-80 w-full object-cover" />
        </div>
      </div>
    </GuestLayout>
  );
}

export function WellnessPage() {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Rest</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">Quiet & warmth in Katpana</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {wellness.map((w) => (
            <Card key={w.title}>
              <CardContent className="p-6 space-y-2">
                <h2 className="font-display text-2xl font-semibold">{w.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}

export function TopicEnquiryPage({ topic, title, desc }: { topic: string; title: string; desc: string }) {
  return (
    <GuestLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{topic}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{desc}</p>
        </div>
        <EnquiryForm topic={topic} title={`Enquire about ${topic.toLowerCase()}`} />
      </div>
    </GuestLayout>
  );
}

export function PlainPolicyPage({ slug }: { slug: string }) {
  const doc = policies[slug] || policies.terms;
  return (
    <GuestLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Resort Policy</p>
        <h1 className="font-display text-4xl font-semibold">{doc.title}</h1>
        <Card>
          <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {doc.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}

export function SitemapPage() {
  const links = [
    ['/', 'Home'],
    ['/rooms', 'Rooms & Huts'],
    ['/book', 'Book a Stay'],
    ['/order', 'Order Food'],
    ['/booking', 'Find a Booking'],
    ['/login', 'Guest Portal'],
    ['/facilities', 'Facilities'],
    ['/activities', 'Activities'],
    ['/gallery', 'Gallery'],
    ['/around', 'Around Skardu'],
    ['/experiences', 'Experiences'],
    ['/offers', 'Offers'],
    ['/dining', 'Dining'],
    ['/blog', 'Journal'],
    ['/faq', 'FAQ'],
    ['/directions', 'Directions'],
    ['/virtual-tour', 'Virtual Tour'],
    ['/reviews', 'Guest Reviews'],
    ['/contact', 'Contact'],
    ['/admin', 'Staff & Admin Portal'],
  ];

  return (
    <GuestLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-6">
        <h1 className="font-display text-4xl font-semibold">Sitemap</h1>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {links.map(([to, label]) => (
            <Link key={to} to={to} className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:border-accent">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}
