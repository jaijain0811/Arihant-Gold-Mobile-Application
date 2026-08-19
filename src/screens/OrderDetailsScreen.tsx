import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { MapPin, CreditCard, Package, Truck, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react-native';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId]);

  if (loading || !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="ORDER DETAILS" />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={themeColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title={`ORDER #${order.orderNumber}`} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Timeline Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>ORDER STATUS</Text>
            <View style={[styles.statusTag, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.statusText, { color: themeColors.accentForeground }]}>{order.status}</Text>
            </View>
          </View>

          {(order.trackingNumber || order.courierPartner || order.notes) ? (
            <View style={{ marginTop: 8, padding: 12, backgroundColor: themeColors.inputBg, borderRadius: 10, borderWidth: 1, borderColor: themeColors.border, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Truck size={18} color={themeColors.accent} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: themeColors.accent }}>
                  LIVE SHIPMENT TRACKING
                </Text>
              </View>

              {order.courierPartner ? (
                <Text style={{ fontSize: 12, color: themeColors.foreground, fontWeight: '700' }}>
                  Courier Partner: <Text style={{ color: themeColors.accent }}>{order.courierPartner}</Text>
                </Text>
              ) : null}

              {order.trackingNumber ? (
                <Text style={{ fontSize: 12, color: themeColors.foreground, fontWeight: '700' }}>
                  AWB Tracking #: <Text style={{ color: themeColors.foreground }}>{order.trackingNumber}</Text>
                </Text>
              ) : null}

              {order.estimatedDelivery ? (
                <Text style={{ fontSize: 11, color: themeColors.mutedForeground }}>
                  Expected Delivery: {order.estimatedDelivery}
                </Text>
              ) : null}

              {order.notes ? (
                <Text style={{ fontSize: 11, color: themeColors.mutedForeground }}>
                  Status Note: {order.notes}
                </Text>
              ) : null}

              {order.trackingUrl ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL(order.trackingUrl!)}
                  style={{
                    marginTop: 4,
                    backgroundColor: themeColors.accent,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <ExternalLink size={14} color={themeColors.accentForeground} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accentForeground }}>
                    TRACK SHIPMENT ON COURIER WEBSITE
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Ordered Items List */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>PURCHASED ITEMS</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemCol}>
                <Text style={[styles.itemTitle, { color: themeColors.foreground }]}>{item.title}</Text>
                {item.selectedSize ? (
                  <Text style={[styles.itemSub, { color: themeColors.mutedForeground }]}>Size: {item.selectedSize}</Text>
                ) : null}
                <Text style={[styles.itemPrice, { color: themeColors.accent }]}>
                  {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.headerRow}>
            <MapPin size={16} color={themeColors.accent} />
            <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>DELIVERY ADDRESS</Text>
          </View>
          <Text style={[styles.addrName, { color: themeColors.foreground }]}>{order.shippingAddress?.fullName}</Text>
          <Text style={[styles.addrSub, { color: themeColors.mutedForeground }]}>
            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </Text>
          <Text style={[styles.addrSub, { color: themeColors.mutedForeground }]}>Phone: {order.shippingAddress?.phone}</Text>
        </View>

        {/* Payment Details */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.headerRow}>
            <CreditCard size={16} color={themeColors.accent} />
            <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>PAYMENT INFO</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>Method</Text>
            <Text style={[styles.infoVal, { color: themeColors.foreground }]}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'qr_code' ? 'QR Code / UPI Payment' : 'Pay Later'}
            </Text>
          </View>
          {order.paymentDetails?.upiTransactionId ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>UTR Ref</Text>
              <Text style={[styles.infoVal, { color: themeColors.accent }]}>{order.paymentDetails.upiTransactionId}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>Payment Status</Text>
            <Text style={[styles.infoVal, { color: themeColors.foreground }]}>{order.paymentStatus}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>Total Paid</Text>
            <Text style={[styles.totalVal, { color: themeColors.accent }]}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' },
  scroll: {
    padding: 16,
    gap: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1 },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4 },
  statusText: {
    fontSize: 10,
    fontWeight: '800' },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4 },
  trackingText: {
    fontSize: 12,
    fontWeight: '700' },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center' },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8 },
  itemCol: {
    flex: 1 },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700' },
  itemSub: {
    fontSize: 11 },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2 },
  addrName: {
    fontSize: 14,
    fontWeight: '800' },
  addrSub: {
    fontSize: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between' },
  infoLabel: {
    fontSize: 12 },
  infoVal: {
    fontSize: 12,
    fontWeight: '700' },
  totalVal: {
    fontSize: 15,
    fontWeight: '900' } });

export default OrderDetailsScreen;
