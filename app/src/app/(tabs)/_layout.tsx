import Tabs from 'expo-router/js-tabs';

/** Tab switching only; every screen draws the Stitch bottom nav itself (components/shell.tsx). */
export default function TabsLayout() {
  return <Tabs tabBar={() => null} screenOptions={{ headerShown: false, lazy: true }} backBehavior="history" />;
}
