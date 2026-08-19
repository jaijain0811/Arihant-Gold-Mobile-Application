import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity,  ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react-native';

export const CheckoutSuccessScreen = ({ route, navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const order = route.params?.order;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.iconBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <CheckCircle size={64} color={themeColors.accent} />
        </View>

        <Text style={[styles.title, { color: themeColors.foreground }]}>ORDER CONFIRMED!</Text>
        <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
          Thank you for choosing Arihant Gold & Luxury. Your order has been placed successfully.
        </Text>

        {order ? (
          <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>Order Number</Text>
              <Text style={[styles.val, { color: themeColors.accent }]}>{order.orderNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>Payment Method</Text>
              <Text style={[styles.val, { color: themeColors.foreground }]}>
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : order.paymentMethod === 'qr_code'
                  ? 'QR Code / UPI Payment'
                  : 'Pay Later'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>Amount Paid/Payable</Text>
              <Text style={[styles.val, { color: themeColors.foreground }]}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>Deliver To</Text>
              <Text style={[styles.val, { color: themeColors.foreground }]}>{order.shippingAddress?.fullName}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: themeColors.accent }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={[styles.btnText, { color: themeColors.accentForeground }]}>VIEW MY ORDERS</Text>
            <ArrowRight size={16} color={themeColors.accentForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('Home')}
          >
            <ShoppingBag size={16} color={themeColors.foreground} />
            <Text style={[styles.outlineText, { color: themeColors.foreground }]}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1 },
  iconBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24 },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 28 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between' },
  label: {
    fontSize: 13 },
  val: {
    fontSize: 13,
    fontWeight: '700' },
  actionBtns: {
    width: '100%',
    gap: 12 },
  btn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8 },
  btnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 },
  outlineBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8 },
  outlineText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 } });

export default CheckoutSuccessScreen;
