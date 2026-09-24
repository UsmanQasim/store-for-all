import { Pressable, Switch, View } from 'react-native';
import { DAY_KEYS, to12h } from '@/lib/format';
import { t } from '@/i18n';
import type { DayKey, OpeningHours } from '@/types/models';
import { Text } from './nw';

const LABEL: Record<DayKey, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

export const DEFAULT_HOURS: OpeningHours = Object.fromEntries(DAY_KEYS.map((d) => [d, d === 'sun' ? [] : [{ open: '10:00', close: '22:00' }]])) as OpeningHours;

/** One range per day; tap a time for +30 min, long-press for −30 min. */
export function HoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
  const set = (d: DayKey, range: { open: string; close: string } | null) => onChange({ ...value, [d]: range ? [range] : [] });
  const step = (time: string, dir: 1 | -1) => TIMES[(TIMES.indexOf(time) + dir + TIMES.length) % TIMES.length]!;

  const TimeBtn = ({ time, onPress, onLong }: { time: string; onPress: () => void; onLong: () => void }) => (
    <Pressable
      onPress={onPress}
      onLongPress={onLong}
      accessibilityRole="button"
      accessibilityLabel={to12h(time)}
      accessibilityHint="Tap for +30 minutes, long-press for −30 minutes"
      className="h-10 min-w-[84px] px-2 rounded-lg bg-surface-container items-center justify-center"
    >
      <Text className="font-label-sm text-label-sm text-on-surface font-semibold">{to12h(time)}</Text>
    </Pressable>
  );

  return (
    <View className="gap-2">
      <Text className="font-caption text-caption text-text-muted">Tap a time for +30 min · long-press for −30 min</Text>
      {DAY_KEYS.map((d) => {
        const r = value[d]?.[0];
        return (
          <View key={d} className={`flex-row items-center gap-2 min-h-[52px] px-2 rounded-lg ${r ? 'bg-surface-container-low' : 'bg-surface-alt'}`}>
            <Text className="font-body-lg text-body-lg text-on-surface w-10">{LABEL[d]}</Text>
            <Switch value={!!r} onValueChange={(on) => set(d, on ? { open: '10:00', close: '22:00' } : null)} trackColor={{ true: '#00543b', false: '#bec9c1' }} thumbColor="#FFFFFF" accessibilityLabel={`${LABEL[d]} open`} />
            {r ? (
              <View className="flex-row items-center gap-1.5 flex-1 justify-end">
                <TimeBtn time={r.open} onPress={() => set(d, { ...r, open: step(r.open, 1) })} onLong={() => set(d, { ...r, open: step(r.open, -1) })} />
                <Text className="text-text-muted">–</Text>
                <TimeBtn time={r.close} onPress={() => set(d, { ...r, close: step(r.close, 1) })} onLong={() => set(d, { ...r, close: step(r.close, -1) })} />
              </View>
            ) : (
              <View className="flex-1 items-end">
                <View className="px-2 py-0.5 rounded-full bg-error-container">
                  <Text className="font-label-sm text-label-sm text-on-error-container">{t('business.closedDay')}</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
