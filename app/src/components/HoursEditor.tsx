import { Pressable, Switch, View } from 'react-native';
import { DAY_KEYS } from '@/lib/format';
import { t } from '@/i18n';
import { useAppTheme } from '@/theme';
import type { DayKey, OpeningHours } from '@/types/models';
import { Text } from './ui';

const LABEL: Record<DayKey, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

export const DEFAULT_HOURS: OpeningHours = Object.fromEntries(
  DAY_KEYS.map((d) => [d, d === 'sun' ? [] : [{ open: '10:00', close: '22:00' }]]),
) as OpeningHours;

/** Simple one-range-per-day editor; tap a time to cycle in 30-min steps. */
export function HoursEditor({ value, onChange }: { value: OpeningHours; onChange: (v: OpeningHours) => void }) {
  const { colors, radius } = useAppTheme();

  const set = (d: DayKey, range: { open: string; close: string } | null) => onChange({ ...value, [d]: range ? [range] : [] });
  const step = (time: string, dir: 1 | -1) => TIMES[(TIMES.indexOf(time) + dir + TIMES.length) % TIMES.length]!;

  const TimeBtn = ({ time, onPress, onLong }: { time: string; onPress: () => void; onLong: () => void }) => (
    <Pressable
      onPress={onPress}
      onLongPress={onLong}
      accessibilityRole="button"
      accessibilityHint="Tap for +30 minutes, long-press for −30 minutes"
      style={{ minHeight: 40, minWidth: 68, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}
    >
      <Text variant="bodyStrong">{time}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>
      {DAY_KEYS.map((d) => {
        const r = value[d]?.[0];
        return (
          <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 }}>
            <Text variant="bodyStrong" style={{ width: 44 }}>{LABEL[d]}</Text>
            <Switch
              value={!!r}
              onValueChange={(on) => set(d, on ? { open: '10:00', close: '22:00' } : null)}
              trackColor={{ true: colors.primary, false: colors.border }}
              accessibilityLabel={`${LABEL[d]} open`}
            />
            {r ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                <TimeBtn time={r.open} onPress={() => set(d, { ...r, open: step(r.open, 1) })} onLong={() => set(d, { ...r, open: step(r.open, -1) })} />
                <Text color="textMuted">–</Text>
                <TimeBtn time={r.close} onPress={() => set(d, { ...r, close: step(r.close, 1) })} onLong={() => set(d, { ...r, close: step(r.close, -1) })} />
              </View>
            ) : (
              <Text color="textMuted" style={{ flex: 1, textAlign: 'right' }}>{t('business.closedDay')}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
