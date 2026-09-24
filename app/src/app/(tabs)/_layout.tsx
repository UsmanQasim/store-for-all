import Ionicons from '@expo/vector-icons/Ionicons';
import Tabs from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';
import type { IconName } from '@/components/ui';
import { t } from '@/i18n';
import { fonts, useAppTheme } from '@/theme';

function icon(name: IconName, active: IconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  const { colors, shadow } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="explore" options={{ title: t('tabs.explore'), tabBarIcon: icon('search-outline', 'search') }} />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tabs.scan'),
          tabBarIcon: ({ focused }) => (
            <View style={[{ width: 52, height: 52, marginTop: -18, borderRadius: 26, backgroundColor: focused ? colors.primaryPressed : colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surface }, shadow.floating]}>
              <Ionicons name="qr-code" size={24} color={colors.onPrimary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="activity" options={{ title: t('tabs.activity'), tabBarIcon: icon('receipt-outline', 'receipt') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
