import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAccessStore } from '../store/accessStore';
import { useAuthStore } from '../store/authStore';
import { AccessIdScreen } from '../screens/AccessIdScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { TabNavigator } from './TabNavigator';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { CheckoutSuccessScreen } from '../screens/CheckoutSuccessScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AdminPortalScreen } from '../screens/AdminPortalScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { ServiceBookingScreen } from '../screens/ServiceBookingScreen';
import { CustomerLedgerScreen } from '../screens/CustomerLedgerScreen';
import { ReturnRequestScreen } from '../screens/ReturnRequestScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ActivityIndicator, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { theme, loadStoredTheme } = useThemeStore();
  const themeColors = colors[theme];

  const { isValidated, isLoading: accessLoading, checkAccessStatus } = useAccessStore();
  const { isAuthenticated, isLoading: authLoading, loadStoredAuth, user } = useAuthStore();

  useEffect(() => {
    checkAccessStatus();
    loadStoredAuth();
    loadStoredTheme();
  }, []);

  if (accessLoading || authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  const isUnlocked = isValidated && isAuthenticated;

  return (
    <Stack.Navigator id="rootStack" screenOptions={{ headerShown: false }}>
      {!isUnlocked ? (
        <>
          {!isValidated && <Stack.Screen name="AccessGate" component={AccessIdScreen} />}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="ServiceBooking" component={ServiceBookingScreen} />
          <Stack.Screen name="CustomerLedger" component={CustomerLedgerScreen} />
          <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="AdminPortal" component={AdminPortalScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
