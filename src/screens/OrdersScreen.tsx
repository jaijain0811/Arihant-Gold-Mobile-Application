import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react-native';

export const OrdersScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getUserOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (e) {
      console.error('Error fetching user orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { color: themeColors.success, icon: CheckCircle2, text: 'Delivered' };
      case 'Shipped':
        return { color: '#3B82F6', icon: Truck, text: 'In Transit' };
      case 'Processing':
        return { color: themeColors.accent, icon: Clock, text: 'Processing' };
      case 'Cancelled':
        return { color: themeColors.destructive, icon: XCircle, text: 'Cancelled' };
      default:
        return { color: themeColors.accent, icon: Clock, text: 'Pending Approval' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="MY ORDERS" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUserOrders();
            }}
            tintColor={themeColors.accent}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={themeColors.accent} />
          </View>
        ) : orders.length > 0 ? (
          <View style={styles.ordersList}>
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <TouchableOpacity
                  key={order.id}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                  style={[styles.orderCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.orderNumGroup}>
                      <Package size={16} color={themeColors.accent} />
                      <Text style={[styles.orderNum, { color: themeColors.foreground }]}>
                        {order.orderNumber}
                      </Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: themeColors.inputBg }]}>
                      <StatusIcon size={12} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.itemCountText, { color: themeColors.mutedForeground }]}>
                      {order.items?.length || 1} Item(s) • Total Amount: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.dateText, { color: themeColors.mutedForeground }]}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
                    <Text style={[styles.viewDetailsText, { color: themeColors.accent }]}>
                      View Order Details & Tracking
                    </Text>
                    <ChevronRight size={16} color={themeColors.accent} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Package size={48} color={themeColors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: themeColors.foreground }]}>No Orders Found</Text>
            <Text style={[styles.emptySub, { color: themeColors.mutedForeground }]}>
              You have not placed any orders yet.
            </Text>
            <TouchableOpacity
              style={[styles.shopBtn, { backgroundColor: themeColors.accent }]}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={[styles.shopBtnText, { color: themeColors.accentForeground }]}>
                START SHOPPING
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16,
    flexGrow: 1 },
  centerLoading: {
    paddingVertical: 60,
    alignItems: 'center' },
  ordersList: {
    gap: 12 },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center' },
  orderNumGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 },
  orderNum: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5 },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6 },
  statusText: {
    fontSize: 11,
    fontWeight: '800' },
  cardBody: {
    gap: 4 },
  itemCountText: {
    fontSize: 13,
    fontWeight: '600' },
  dateText: {
    fontSize: 11 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1 },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '800' },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800' },
  emptySub: {
    fontSize: 13 },
  shopBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8 },
  shopBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1 } });

export default OrdersScreen;
