import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  
  ActivityIndicator,
  Alert
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { orderService } from '../services/orderService';
import { AppSettings } from '../types';
import {
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  Clock,
  CheckCircle2,
  Copy,
  UploadCloud,
  ShieldCheck
} from 'lucide-react-native';

export const CheckoutScreen = ({ route, navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { items, getSubtotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const appliedDiscount = route?.params?.appliedDiscount || 0;
  const couponCode = route?.params?.couponCode || '';

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Address Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Method Selection: 'cod' | 'qr_code' | 'pay_later'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr_code' | 'pay_later'>('cod');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= (settings?.delivery?.freeShippingThreshold || 2000) ? 0 : (settings?.delivery?.shippingFee || 100);
  const totalAmount = Math.max(0, subtotal - appliedDiscount + shippingFee);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const res = await orderService.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
          // Set default payment method based on what is enabled
          if (res.data.paymentMethods?.cod?.enabled) {
            setPaymentMethod('cod');
          } else if (res.data.paymentMethods?.qrCode?.enabled) {
            setPaymentMethod('qr_code');
          } else if (res.data.paymentMethods?.payLater?.enabled) {
            setPaymentMethod('pay_later');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    if (paymentMethod === 'qr_code' && !upiTxnId.trim()) {
      setErrorMsg('Please enter your UPI Transaction / UTR reference number.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.title,
          image: i.product.images?.[0] || '',
          price: i.product.price,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: stateName.trim() || 'State',
          pincode: pincode.trim() },
        paymentMethod,
        paymentDetails: {
          upiTransactionId: upiTxnId.trim() || undefined,
          paymentProofUrl: paymentProofUrl.trim() || undefined,
          payLaterApproved: paymentMethod === 'pay_later' },
        couponCode: couponCode || undefined };

      const res = await orderService.createOrder(orderPayload);

      if (res.success && res.order) {
        clearCart();
        navigation.reset({
          index: 0,
          routes: [{ name: 'CheckoutSuccess', params: { order: res.order } }] });
      } else {
        setErrorMsg(res.message || 'Failed to place order.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Error processing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="CHECKOUT" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Shipping Address Section */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>DELIVERY ADDRESS</Text>
          </View>

          <View style={styles.formGrid}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit Phone Number"
              placeholderTextColor={themeColors.mutedForeground}
              keyboardType="phone-pad"
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Flat / Building / Street Address"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <View style={styles.rowTwo}>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={themeColors.mutedForeground}
                style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
              />
              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="Pincode"
                placeholderTextColor={themeColors.mutedForeground}
                keyboardType="numeric"
                style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
              />
            </View>
          </View>
        </View>

        {/* Payment Methods Section (COD, QR Code, Pay Later) */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>SELECT PAYMENT METHOD</Text>
          </View>

          <View style={styles.methodsList}>
            {/* Cash on Delivery (COD) */}
            {settings?.paymentMethods?.cod?.enabled !== false && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setPaymentMethod('cod')}
                style={[
                  styles.methodOption,
                  {
                    backgroundColor: paymentMethod === 'cod' ? themeColors.secondary : themeColors.inputBg,
                    borderColor: paymentMethod === 'cod' ? themeColors.accent : themeColors.border },
                ]}
              >
                <View style={styles.methodHeader}>
                  <Banknote size={20} color={themeColors.accent} />
                  <View style={styles.methodTitleCol}>
                    <Text style={[styles.methodTitle, { color: themeColors.foreground }]}>Cash on Delivery (COD)</Text>
                    <Text style={[styles.methodSub, { color: themeColors.mutedForeground }]}>
                      Pay cash upon delivery of your order.
                    </Text>
                  </View>
                  {paymentMethod === 'cod' ? <CheckCircle2 size={20} color={themeColors.accent} /> : null}
                </View>
              </TouchableOpacity>
            )}

            {/* QR Code Payment */}
            {settings?.paymentMethods?.qrCode?.enabled !== false && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setPaymentMethod('qr_code')}
                style={[
                  styles.methodOption,
                  {
                    backgroundColor: paymentMethod === 'qr_code' ? themeColors.secondary : themeColors.inputBg,
                    borderColor: paymentMethod === 'qr_code' ? themeColors.accent : themeColors.border },
                ]}
              >
                <View style={styles.methodHeader}>
                  <QrCode size={20} color={themeColors.accent} />
                  <View style={styles.methodTitleCol}>
                    <Text style={[styles.methodTitle, { color: themeColors.foreground }]}>QR Code Payment (UPI)</Text>
                    <Text style={[styles.methodSub, { color: themeColors.mutedForeground }]}>
                      Scan QR or transfer to UPI ID, then enter UTR ref.
                    </Text>
                  </View>
                  {paymentMethod === 'qr_code' ? <CheckCircle2 size={20} color={themeColors.accent} /> : null}
                </View>

                {/* Expanded QR Code Details */}
                {paymentMethod === 'qr_code' && (
                  <View style={[styles.qrExpandedBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Image
                      source={require('../assets/qr_code.jpg')}
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                    <Text style={[styles.upiIdText, { color: themeColors.accent }]}>
                      Jai Jain • UPI ID: jaijain1466@okicici
                    </Text>
                    <Text style={{ fontSize: 11, color: themeColors.mutedForeground, marginTop: 2, textAlign: 'center' }}>
                      Scan to pay with Google Pay, PhonePe, Paytm, or any UPI app
                    </Text>

                    <TextInput
                      value={upiTxnId}
                      onChangeText={setUpiTxnId}
                      placeholder="Enter 12-digit UTR / UPI Ref Number"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground, marginTop: 10, width: '100%' }]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Pay Later */}
            {settings?.paymentMethods?.payLater?.enabled !== false && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setPaymentMethod('pay_later')}
                style={[
                  styles.methodOption,
                  {
                    backgroundColor: paymentMethod === 'pay_later' ? themeColors.secondary : themeColors.inputBg,
                    borderColor: paymentMethod === 'pay_later' ? themeColors.accent : themeColors.border },
                ]}
              >
                <View style={styles.methodHeader}>
                  <Clock size={20} color={themeColors.accent} />
                  <View style={styles.methodTitleCol}>
                    <Text style={[styles.methodTitle, { color: themeColors.foreground }]}>Pay Later Option</Text>
                    <Text style={[styles.methodSub, { color: themeColors.mutedForeground }]}>
                      Pay within 30 days. Pre-approved limit up to ₹50,000.
                    </Text>
                  </View>
                  {paymentMethod === 'pay_later' ? <CheckCircle2 size={20} color={themeColors.accent} /> : null}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Order Breakdown */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>PAYMENT BREAKDOWN</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: themeColors.mutedForeground }]}>Subtotal ({items.length} items)</Text>
            <Text style={[styles.priceVal, { color: themeColors.foreground }]}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {appliedDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: themeColors.success }]}>Promo Discount</Text>
              <Text style={[styles.priceVal, { color: themeColors.success }]}>-₹{appliedDiscount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: themeColors.mutedForeground }]}>Express Shipping</Text>
            <Text style={[styles.priceVal, { color: themeColors.foreground }]}>
              {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: themeColors.foreground }]}>Total Amount</Text>
            <Text style={[styles.totalVal, { color: themeColors.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {errorMsg ? <Text style={[styles.errorText, { color: themeColors.destructive }]}>{errorMsg}</Text> : null}
      </ScrollView>

      {/* Place Order Bar */}
      <View style={[styles.placeOrderBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
        <View style={styles.totalBox}>
          <Text style={[styles.totalSub, { color: themeColors.mutedForeground }]}>FINAL TOTAL</Text>
          <Text style={[styles.totalAmountText, { color: themeColors.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={submitting}
          onPress={handlePlaceOrder}
          style={[styles.placeBtn, { backgroundColor: themeColors.accent }]}
        >
          {submitting ? (
            <ActivityIndicator color={themeColors.accentForeground} />
          ) : (
            <Text style={[styles.placeBtnText, { color: themeColors.accentForeground }]}>CONFIRM & PLACE ORDER</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16,
    paddingBottom: 100,
    gap: 16 },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  formGrid: {
    gap: 10 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600' },
  rowTwo: {
    flexDirection: 'row',
    gap: 10 },
  halfInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600' },
  methodsList: {
    gap: 10 },
  methodOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1 },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 },
  methodTitleCol: {
    flex: 1 },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800' },
  methodSub: {
    fontSize: 11,
    marginTop: 2 },
  qrExpandedBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center' },
  qrCodeImage: {
    width: 220,
    height: 260,
    borderRadius: 12,
    marginBottom: 8
  },
  upiIdText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between' },
  priceLabel: {
    fontSize: 13 },
  priceVal: {
    fontSize: 13,
    fontWeight: '700' },
  divider: {
    height: 1,
    marginVertical: 4 },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800' },
  totalVal: {
    fontSize: 18,
    fontWeight: '900' },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center' },
  placeOrderBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1 },
  totalBox: {
    flexDirection: 'column' },
  totalSub: {
    fontSize: 10,
    fontWeight: '700' },
  totalAmountText: {
    fontSize: 18,
    fontWeight: '900' },
  placeBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center' },
  placeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 } });

export default CheckoutScreen;
