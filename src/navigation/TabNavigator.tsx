import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme';
import { Home, Grid, Heart, Package, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = colors[theme];

  return (
    <Tab.Navigator
      id="mainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: themeColors.accent,
        tabBarInactiveTintColor: themeColors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{
          tabBarLabel: t('shop'),
          tabBarIcon: ({ color, size }) => <Grid size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen}
        options={{
          tabBarLabel: t('wishlist'),
          tabBarIcon: ({ color, size }) => <Heart size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: t('my_orders'),
          tabBarIcon: ({ color, size }) => <Package size={size || 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => <User size={size || 20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
