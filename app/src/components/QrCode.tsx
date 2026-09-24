import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { qrSvg } from '@/lib/qr';

export function QrCode({ value, size = 240, color = '#04291E' }: { value: string; size?: number; color?: string }) {
  const [xml, setXml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    qrSvg(value, color).then((s) => alive && setXml(s));
    return () => {
      alive = false;
    };
  }, [value, color]);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }} accessibilityLabel={`QR code for ${value}`}>
      {xml ? <SvgXml xml={xml} width={size} height={size} /> : <ActivityIndicator />}
    </View>
  );
}
