import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DrawerContent from '../components/DrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerTintColor: colors.black,
        drawerActiveTintColor: colors.black,
        drawerActiveBackgroundColor: colors.lightGreen,
        drawerLabelStyle: { fontWeight: '700' },
      }}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Ganancias" component={EarningsScreen} />
      <Drawer.Screen
        name="Historial"
        component={HistoryScreen}
        options={{ title: 'Historial de carreras' }}
      />
      <Drawer.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ title: 'Perfil y configuración' }}
      />
    </Drawer.Navigator>
  );
}
