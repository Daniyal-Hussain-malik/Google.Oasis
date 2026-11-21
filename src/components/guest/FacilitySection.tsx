import React, { useEffect, useState } from 'react';
import {
  Wifi,
  UtensilsCrossed,
  Car,
  Flame,
  ShieldCheck,
  Sparkles,
  Phone,
  Coffee,
  Mountain,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { api } from '@/src/lib/api';

interface FacilityItem {
  id?: number | string;
  name: string;
  detail: string;
  group: string;
  tag: string;
  icon: string;
}

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  restaurant: <UtensilsCrossed className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  jacuzzi: <Flame className="h-5 w-5" />,
  service: <Sparkles className="h-5 w-5" />,
  phone: <Phone className="h-5 w-5" />,
  water: <Coffee className="h-5 w-5" />,
  balcony: <Mountain className="h-5 w-5" />,
  star: <CheckCircle2 className="h-5 w-5" />,
};

export function FacilityShowcase({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<FacilityItem[]>([]);
  const [group, setGroup] = useState('All');

  useEffect(() => {
    api<{ facilities: FacilityItem[] }>('/public/site')
      .then((res) => setItems(res.facilities || []))
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  const shown = compact ? items.slice(0, 6) : items;
  const groups = ['All', ...Array.from(new Set(shown.map((f) => f.group).filter(Boolean)))];
  const filtered = group === 'All' ? shown : shown.filter((f) => f.group === group);

  return (
    <div className="space-y-6">
      {!compact && groups.length > 1 && (
        <Tabs value={group} onValueChange={setGroup}>
          <TabsList className="flex-wrap h-auto">
            {groups.map((g) => (
              <TabsTrigger key={g} value={g}>
                {g}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={group} />
        </Tabs>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.name} className="transition-colors hover:border-accent/50">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                {iconMap[item.icon] || <ShieldCheck className="h-5 w-5" />}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                <p className="pt-1 text-xs text-muted-foreground/80">
                  {item.group} · {item.tag}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
