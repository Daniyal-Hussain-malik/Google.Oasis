import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  Car,
  ChevronDown,
  Coffee,
  Flame,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import { GuestLayout } from '@/src/components/guest/GuestLayout';
import { HeroCarousel, type HeroSlide } from '@/src/components/guest/HeroCarousel';
import { StoryPhotoCarousel, type StorySlide } from '@/src/components/guest/StoryPhotoCarousel';
import { FacilityShowcase } from '@/src/components/guest/FacilitySection';
import { EnquiryForm } from '@/src/components/guest/EnquiryForm';
import { ResilientImage } from '@/src/components/guest/ResilientImage';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Separator } from '@/src/components/ui/separator';
import { useI18n } from '@/src/context/I18nContext';
import { addDays, api, clamp, media, pkr, todayISO } from '@/src/lib/api';
import { defaultReviews, journals, official, photos, presentStay } from '@/src/data/resortContent';

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [businessDate, setBusinessDate] = useState(todayISO());
  const [types, setTypes] = useState<any[]>([]);
  const [site, setSite] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Array<{ guestName: string; rating: number; comment: string }>>([]);
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const [bookingHalfHeight, setBookingHalfHeight] = useState(60);
  const [form, setForm] = useState({
    checkIn: todayISO(),
    checkOut: addDays(todayISO(), 2),
    adults: 2,
    children: 0,
    rooms: 1,
  });

  useEffect(() => {
    api<{ businessDate: string }>('/public/hotel')
      .then((res) => {
        if (res.businessDate) {
          setBusinessDate(res.businessDate);
          setForm((prev) => ({
            ...prev,
            checkIn: res.businessDate,
            checkOut: addDays(res.businessDate, 2),
          }));
        }
      })
      .catch(() => {});

    api<any[]>('/public/room-types').then(setTypes).catch(() => {});
    api('/public/site').then(setSite).catch(() => {});
    api<any[]>('/public/menu')
      .then((items) => setDishes(items.filter((d) => d.image).slice(0, 4)))
      .catch(() => {});
    api<any[]>('/public/blog')
      .then((posts) => setBlogPosts(Array.isArray(posts) ? posts.slice(0, 3) : []))
      .catch(() => {});
    api<any[]>('/public/reviews')
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setReviews(rows.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = bookingCardRef.current;
    if (!el) return;
    const syncHalfHeight = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setBookingHalfHeight(Math.round(h / 2));
    };
    syncHalfHeight();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncHalfHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function updateCheckIn(value: string) {
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      checkIn: value,
      checkOut: prev.checkOut > value ? prev.checkOut : addDays(value, 2),
    }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: String(form.adults),
      children: String(form.children),
      rooms: String(form.rooms),
    });
    if (promoCode.trim()) params.set('offer', promoCode.trim());
    navigate(`/book?${params.toString()}`);
  }

  const liveActivities: Array<{ image?: string; title: string; body: string }> =
    site?.activities?.length
      ? site.activities
      : [
          { image: official.jeep, title: 'Dune safari', body: 'A jeep leaves from the door. The loop stays on the cold desert and comes back before dark.' },
          { image: official.stargazing, title: 'Stars', body: 'The desert is dark enough for the sky. Ask the desk if you want a quiet hour outside.' },
          { image: official.camel, title: 'A sunset walk', body: 'The sand is the walk. Tell reception if you want it timed with the fire.' },
          { image: official.view, title: 'The ridge', body: 'The same window in the morning is the Karakoram. Shangrila is a separate day, by jeep.' },
        ];

  const liveExperiences: any[] = site?.experiences?.filter((x: any) => x.active !== false) || [];
  const visibleReviews = reviews.length
    ? reviews
    : defaultReviews.map(([guestName, comment]) => ({ guestName, rating: 5, comment }));

  const heroSlides: HeroSlide[] = [
    {
      src: photos.wide,
      alt: 'Glass-fronted huts on the Katpana cold desert with the Karakoram peaks behind',
      label: 'Katpana Cold Desert',
      caption: 'Glass-fronted timber huts facing the Karakoram',
      objectPosition: 'object-[center_62%]',
    },
    {
      src: official.desertK2,
      alt: 'Sunset on the Katpana dunes with high mountain peaks behind Oasis Resort Skardu',
      label: 'Dunes & Peaks',
      caption: 'Evening light over the Skardu dunes',
      objectPosition: 'object-center',
    },
    {
      src: official.landscape,
      alt: 'The full Oasis Resort grounds across the Katpana desert valley',
      label: 'Oasis Grounds',
      caption: 'Low timber chalets set across the sand',
      objectPosition: 'object-center',
    },
    {
      src: photos.panorama,
      alt: 'The full row of huts at Oasis Resort Skardu in winter light',
      label: 'Skardu Winter',
      caption: 'Heated huts overlooking the snow ridge',
      objectPosition: 'object-[center_58%]',
    },
  ];

  const storySlides: StorySlide[] = [
    {
      src: photos.row,
      alt: 'The row of huts facing the Katpana snowfield',
      caption: 'The row, facing the Katpana dune. Check-in is from 2:00 PM.',
    },
    {
      src: photos.snow,
      alt: 'Winter light along the red roofs of Oasis Resort Skardu',
      caption: 'Winter light along the red roofs — heated huts before you arrive.',
    },
    {
      src: photos.cloud,
      alt: 'Timber cottages set against bare Katpana dunes and cloud cover',
      caption: 'The same hut row when the desert sand is clear beneath the peaks.',
    },
    {
      src: official.rooms,
      alt: 'Walkway along the chalet terrace looking out toward the Karakoram',
      caption: 'Glass fronts opening straight onto 165 kanals of cold desert.',
    },
  ];

  return (
    <GuestLayout>
      {/* 1. Hero Showcase with 4-Image Shadcn + Material UI Carousel */}
      <HeroCarousel slides={heroSlides}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-auto max-w-2xl pt-2 text-white"
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-[1px] w-8 bg-amber-300/85" />
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:text-xs">
              {t.kicker}
            </p>
          </div>
          <h1 className="font-display mt-3.5 text-5xl font-medium leading-[0.98] tracking-[-0.02em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-[5.25rem]">
            {site?.heroTitle || t.hero}
          </h1>
          <p className="mt-5 max-w-xl border-l border-amber-300/60 pl-4 text-base font-normal leading-relaxed tracking-[0.01em] text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-lg lg:text-[1.2rem]">
            {site?.heroLede || t.heroBody}
          </p>
        </motion.div>
      </HeroCarousel>

      {/* 2. Seam-Centered Booking Bar (exact 50/50 bridge between Section 1 & Section 2) + Assurance Strip */}
      <section className="relative flow-root border-b border-border bg-card">
        <div
          ref={bookingCardRef}
          style={{ marginTop: -bookingHalfHeight }}
          className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <Card className="border-border/80 bg-card/98 shadow-2xl backdrop-blur-md">
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {t.checkIn}
                      </span>
                      <Input
                        type="date"
                        required
                        min={businessDate}
                        value={form.checkIn}
                        onChange={(e) => updateCheckIn(e.target.value)}
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {t.checkOut}
                      </span>
                      <Input
                        type="date"
                        required
                        min={form.checkIn ? addDays(form.checkIn, 1) : undefined}
                        value={form.checkOut}
                        onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      Guests & Rooms
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between font-normal">
                          <span className="truncate tabular-nums">
                            {form.adults} {form.adults === 1 ? 'adult' : 'adults'}
                            {form.children > 0 ? ` · ${form.children} children` : ''} · {form.rooms}{' '}
                            {form.rooms === 1 ? 'room' : 'rooms'}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t.adults}</span>
                          <Input
                            type="number"
                            min={1}
                            max={16}
                            className="w-20 tabular-nums"
                            value={form.adults}
                            onChange={(e) => setForm((p) => ({ ...p, adults: clamp(e.target.value, 1, 16) }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t.children}</span>
                          <Input
                            type="number"
                            min={0}
                            max={12}
                            className="w-20 tabular-nums"
                            value={form.children}
                            onChange={(e) => setForm((p) => ({ ...p, children: clamp(e.target.value, 0, 12) }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rooms</span>
                          <Input
                            type="number"
                            min={1}
                            max={4}
                            className="w-20 tabular-nums"
                            value={form.rooms}
                            onChange={(e) => setForm((p) => ({ ...p, rooms: clamp(e.target.value, 1, 4) }))}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button type="submit" variant="accent" size="lg" className="w-full md:w-auto">
                    {t.search}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPromo((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {showPromo ? 'Hide promo code' : 'Have an offer or promo code?'}
                  </button>
                  {showPromo && (
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter offer code (e.g. WINTER)"
                      className="h-8 max-w-xs text-xs"
                    />
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 pb-8 pt-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: <Coffee className="h-5 w-5 text-accent" />, title: 'Breakfast included', sub: 'In every direct room rate' },
            { icon: <Flame className="h-5 w-5 text-accent" />, title: 'Heated before arrival', sub: 'Warm huts throughout winter' },
            { icon: <Car className="h-5 w-5 text-accent" />, title: 'Airport transfer', sub: 'Complimentary on 3+ nights' },
            { icon: <Sparkles className="h-5 w-5 text-accent" />, title: 'Book direct & save', sub: 'Best rate, no middleman' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Welcome / Your base in Katpana */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">{t.storyKicker}</p>
            <h2 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">{t.storyTitle}</h2>
            <p className="text-base leading-relaxed text-muted-foreground">{t.storyBody}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The huts are glass at the front, stone at the base, and heated before you arrive. Breakfast is included,
              and an extra mattress is PKR 2,500 if you tell the desk ahead.
            </p>
            <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">19</p>
                <p className="text-xs text-muted-foreground">Private desert huts</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">15 min</p>
                <p className="text-xs text-muted-foreground">From Skardu airport</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">165</p>
                <p className="text-xs text-muted-foreground">Kanals along the dune</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="outline">
                <Link to="/virtual-tour">Walk the grounds</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/directions">Directions & map</Link>
              </Button>
            </div>
          </div>

          <StoryPhotoCarousel slides={storySlides} />
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* 4. Choose Your Stay */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Accommodation</p>
            <h2 className="font-display mt-1 text-4xl font-semibold text-foreground sm:text-5xl">{t.roomsTitle}</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/rooms">All accommodation</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {types.slice(0, 5).map((raw, index) => {
            const room = presentStay(raw);
            return (
              <Card
                key={room._id}
                className={`overflow-hidden transition-colors hover:border-accent/50 ${
                  index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div className={index === 0 ? 'grid h-full md:grid-cols-2' : 'flex h-full flex-col'}>
                  <div className={index === 0 ? 'h-64 md:h-full' : 'h-56'}>
                    <ResilientImage
                      src={room.image}
                      alt={room.name}
                      fallbackTitle={room.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {[room.bed, room.size, `${room.maxAdults} adults`].filter(Boolean).join(' · ')}
                      </p>
                      <h3 className="font-display text-3xl font-semibold text-foreground">{room.name}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{room.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <span className="text-xs text-muted-foreground">{t.from} </span>
                        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                          {pkr(room.baseRate)}
                        </span>
                        <span className="text-xs text-muted-foreground"> / night</span>
                      </div>
                      <Button asChild size="sm" variant="default">
                        <Link to={`/book?type=${room._id}`}>{t.choose}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. From the Resort — Live CMS Activities ("Days on the sand") */}
      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-accent">From the resort</p>
              <h2 className="font-display mt-1 text-4xl font-semibold text-foreground sm:text-5xl">
                Activities &amp; days on the sand
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/activities">All activities</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {liveActivities.slice(0, 4).map((act, idx) => (
              <Card key={`${act.title}-${idx}`} className="overflow-hidden">
                <div className="h-44">
                  <ResilientImage
                    src={media(act.image) || official.jeep}
                    alt={act.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-5 space-y-2">
                  <h3 className="font-display text-2xl font-semibold">{act.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{act.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Inside the Hut */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Rooms &amp; Morning Tray</p>
          <h2 className="font-display mt-1 text-4xl font-semibold text-foreground sm:text-5xl">Inside the hut</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Carved beds, a valley window, and the same breakfast whether you eat it in the room or at the table.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [photos.deluxeDay, 'Morning in the deluxe room', 'King bed, carved wood, and the poplar valley through the glass.'],
            [photos.executive, 'The executive room', 'Heavier curtains, the same view, and chairs by the window.'],
            [photos.breakfast, 'Breakfast, included', 'Eggs, toast, tea, and jam. Ask the night before if you want the tray at the hut.'],
          ].map(([src, title, text]) => (
            <Card key={title} className="overflow-hidden">
              <div className="h-48">
                <ResilientImage src={src} alt={title} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-display text-2xl font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. The Kitchen & Dining */}
      {dishes.length > 0 && (
        <section className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent">The kitchen</p>
                <h2 className="font-display mt-1 text-4xl font-semibold text-foreground sm:text-5xl">{t.dineTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.dineBody}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to="/dining">Dining Guide</Link>
                </Button>
                <Button asChild variant="accent">
                  <Link to="/order">Order Food</Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dishes.map((dish) => (
                <Card key={dish._id} className="overflow-hidden">
                  <div className="h-44">
                    <ResilientImage
                      src={media(dish.image)}
                      alt={dish.name}
                      fallbackTitle={dish.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{dish.name}</h3>
                      <span className="font-mono text-xs font-semibold tabular-nums text-accent">{pkr(dish.price)}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{dish.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Facilities (Live CMS Facilities) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Facilities</p>
            <h2 className="font-display mt-1 text-4xl font-semibold text-foreground">Built for high-altitude comfort</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/facilities">All facilities</Link>
          </Button>
        </div>
        <FacilityShowcase compact />
      </section>

      {/* 9. Experiences (Live CMS Experiences + Signature Outings) */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Experiences</p>
            <h2 className="font-display mt-1 text-4xl font-semibold text-foreground">Evenings &amp; outings at Katpana</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/experiences">All experiences</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(liveExperiences.length
            ? liveExperiences.slice(0, 3).map((x) => ({
                img: media(x.image) || photos.bonfire,
                kicker: x.kicker || 'Oasis Experience',
                title: x.title,
                summary: x.summary,
                to: `/experiences/${x.slug}`,
              }))
            : [
                {
                  img: photos.bonfire,
                  kicker: 'After six',
                  title: 'Fire on the sand',
                  summary: 'Tell the desk by six. Chairs go out on the dune side, and dinner can be served there.',
                  to: '/experiences/bonfire',
                },
                {
                  img: photos.jeep,
                  kicker: 'Afternoons',
                  title: 'A jeep, when you want one',
                  summary: 'Dune loops leave from the hut, not from town. The desk writes the return time down.',
                  to: '/activities',
                },
                {
                  img: photos.shangrila,
                  kicker: 'A day out',
                  title: 'Shangrila Lake excursion',
                  summary: 'Lower Kachura sits a scenic drive away. Our desk arranges transport before dark.',
                  to: '/around/shangrila',
                },
              ]
          ).map((card) => (
            <Card key={card.title} className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-52">
                  <ResilientImage src={card.img} alt={card.title} className="h-full w-full object-cover" />
                </div>
                <CardContent className="p-6 space-y-2">
                  <p className="text-xs text-muted-foreground">{card.kicker}</p>
                  <h3 className="font-display text-2xl font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.summary}</p>
                </CardContent>
              </div>
              <div className="px-6 pb-6">
                <Link to={card.to} className="text-sm font-medium text-accent hover:underline">
                  Read more →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 10. Resort Journal / Blog & Guest Reviews */}
      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent">Resort Journal &amp; Blog</p>
                <h2 className="font-display mt-1 text-4xl font-semibold text-foreground">Stories from Katpana</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/blog">Read the blog</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {(blogPosts.length ? blogPosts : journals).slice(0, 3).map((post: any) => (
                <Card key={post.slug} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-44">
                      <ResilientImage src={media(post.image) || photos.wide} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <p className="text-xs text-muted-foreground">{post.authorName || post.kicker || 'Oasis Team'}</p>
                      <h3 className="font-display text-2xl font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt || post.summary}</p>
                    </CardContent>
                  </div>
                  <div className="px-5 pb-5">
                    <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-accent hover:underline">
                      Read story →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent">Guest Voices</p>
                <h2 className="font-display mt-1 text-4xl font-semibold text-foreground">From guests who stayed</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/reviews">All reviews</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {visibleReviews.map((rev, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-3">
                    <Rating value={rev.rating} readOnly size="small" />
                    <p className="text-sm leading-relaxed text-muted-foreground">“{rev.comment}”</p>
                    <p className="text-sm font-semibold text-foreground">{rev.guestName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. Seasonal Updates / Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EnquiryForm
          topic="Newsletter"
          title="Seasonal updates from Katpana"
          prompt="Receive winter opening rates, direct stay offers, and Skardu travel notes from the desk."
        />
      </section>
    </GuestLayout>
  );
}
