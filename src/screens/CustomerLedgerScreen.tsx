import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import {
  CreditCard,
  Receipt,
  QrCode,
  CheckCircle,
  X,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight
} from 'lucide-react-native';
import api from '../services/api';

export const CustomerLedgerScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [partyData, setPartyData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payUtr, setPayUtr] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pos/customer/ledger', {
        params: {
          email: user?.email || '',
          phone: user?.phone || '',
          userId: user?.id || ''
        }
      });

      if (res.data?.success) {
        setPartyData(res.data.party);
        setTransactions(res.data.transactions || []);
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [user]);

  const handleSubmitPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    try {
      setPaySubmitting(true);
      await api.post('/pos/admin/parties/payment', {
        partyId: partyData?.id,
        amount: Number(payAmount),
        paymentMethod: 'UPI QR',
        notes: `Customer Mobile App Payment (UTR: ${payUtr || 'Self-paid'})`
      });

      Alert.alert('Payment Recorded!', 'Your payment has been logged successfully and updated on your ledger balance.');
      setShowPayModal(false);
      setPayAmount('');
      setPayUtr('');
      fetchLedger();
    } catch (e: any) {
      Alert.alert('Payment Error', e.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setPaySubmitting(false);
    }
  };

  const currentBal = partyData?.currentBalance || 0;
  const totalBilled = partyData?.totalBilled || 0;
  const totalPaid = partyData?.totalPaid || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="MY ACCOUNT & LEDGER" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={{ color: themeColors.mutedForeground, marginTop: 10, fontSize: 13 }}>
            Syncing account balance with store...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Company Branding Header */}
          <View style={{ alignItems: 'center', marginBottom: 12, padding: 12, backgroundColor: themeColors.card, borderRadius: 14, borderWidth: 1, borderColor: themeColors.border }}>
            <Image source={require('../assets/logo.png')} style={{ width: 150, height: 45, resizeMode: 'contain' }} />
            <Text style={{ fontSize: 16, fontWeight: '900', color: themeColors.accent, marginTop: 4, letterSpacing: 1.5 }}>ARIHANT GOLD</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: themeColors.mutedForeground, letterSpacing: 0.5, marginTop: 1 }}>24K FORMING JEWELLERY BOUTIQUE</Text>
            <Text style={{ fontSize: 10, color: themeColors.mutedForeground, marginTop: 2 }}>Shop No.31/B, Saas Bahu Building, Kalbadevi Rd, Mumbai</Text>
          </View>

          {/* Main Account Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: themeColors.card, borderColor: themeColors.accent }]}>
            <Text style={styles.cardHeaderTitle}>ACCOUNT STATEMENT SUMMARY</Text>

            <View style={styles.balanceMainRow}>
              <View>
                <Text style={[styles.balanceLabel, { color: themeColors.mutedForeground }]}>
                  Outstanding Due Balance
                </Text>
                <Text style={[styles.balanceValue, { color: currentBal > 0 ? '#EF4444' : '#10B981' }]}>
                  ₹{currentBal.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View style={styles.subStatsRow}>
              <View style={styles.subStatBox}>
                <Text style={[styles.subStatLabel, { color: themeColors.mutedForeground }]}>Total Billed</Text>
                <Text style={[styles.subStatValue, { color: themeColors.foreground }]}>
                  ₹{totalBilled.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.subStatBox}>
                <Text style={[styles.subStatLabel, { color: themeColors.mutedForeground }]}>Total Paid</Text>
                <Text style={[styles.subStatValue, { color: '#10B981' }]}>
                  ₹{totalPaid.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Transaction Ledger Statement */}
          <View style={styles.sectionHeader}>
            <Receipt size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
              TRANSACTION LEDGER HISTORY ({transactions.length})
            </Text>
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <Text style={{ color: themeColors.mutedForeground, fontSize: 13, textAlign: 'center' }}>
                No party ledger entries yet. Your store orders and bill payments will reflect here automatically.
              </Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {transactions.map((tx) => (
                <View
                  key={tx.id}
                  style={[styles.txCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                >
                  <View style={styles.txIconContainer}>
                    {tx.type === 'payment' || tx.credit > 0 ? (
                      <ArrowDownLeft size={20} color="#10B981" />
                    ) : (
                      <ArrowUpRight size={20} color="#EF4444" />
                    )}
                  </View>

                  <View style={styles.txDetails}>
                    <Text style={[styles.txTitle, { color: themeColors.foreground }]}>{tx.description}</Text>
                    <Text style={[styles.txDate, { color: themeColors.mutedForeground }]}>
                      {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View style={styles.txAmounts}>
                    {tx.debit > 0 && (
                      <Text style={[styles.txDebit, { color: '#EF4444' }]}>+ ₹{tx.debit}</Text>
                    )}
                    {tx.credit > 0 && (
                      <Text style={[styles.txCredit, { color: '#10B981' }]}>- ₹{tx.credit}</Text>
                    )}
                    <Text style={[styles.txBalAfter, { color: themeColors.mutedForeground }]}>
                      Bal: ₹{tx.balanceAfter}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Orders & Bills Quick List */}
          {orders.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <View style={styles.sectionHeader}>
                <FileText size={18} color={themeColors.accent} />
                <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
                  MY ORDER INVOICES ({orders.length})
                </Text>
              </View>

              <View style={styles.txList}>
                {orders.map((ord) => (
                  <TouchableOpacity
                    key={ord.id}
                    activeOpacity={0.8}
                    style={[styles.txCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: ord.id })}
                  >
                    <View style={styles.txDetails}>
                      <Text style={[styles.txTitle, { color: themeColors.accent }]}>Order #{ord.orderNumber}</Text>
                      <Text style={[styles.txDate, { color: themeColors.mutedForeground }]}>
                        {ord.items?.length || 1} Item(s) • Status: {ord.status}
                      </Text>
                    </View>
                    <View style={styles.txAmounts}>
                      <Text style={[styles.txTitle, { color: themeColors.foreground }]}>₹{ord.totalAmount}</Text>
                      <Text style={{ fontSize: 11, color: ord.paymentStatus === 'Paid' ? '#10B981' : '#EF4444', fontWeight: '800' }}>
                        {ord.paymentStatus}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={themeColors.mutedForeground} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' },
  scroll: {
    padding: 16,
    gap: 16 },
  balanceCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5 },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 10 },
  balanceMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 },
  balanceLabel: {
    fontSize: 12 },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2 },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10 },
  payNowText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5 },
  subStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 12,
    gap: 16 },
  subStatBox: {
    flex: 1 },
  subStatLabel: {
    fontSize: 11 },
  subStatValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8 },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center' },
  txList: {
    gap: 8 },
  txCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 },
  txIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center' },
  txDetails: {
    flex: 1 },
  txTitle: {
    fontSize: 13,
    fontWeight: '700' },
  txDate: {
    fontSize: 11,
    marginTop: 2 },
  txAmounts: {
    alignItems: 'flex-end' },
  txDebit: {
    fontSize: 13,
    fontWeight: '800' },
  txCredit: {
    fontSize: 13,
    fontWeight: '800' },
  txBalAfter: {
    fontSize: 10,
    marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12 },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1 },
  qrContainer: {
    backgroundColor: '#0b0907',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10 },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4 },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13 },
  submitPayBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8 },
  submitPayText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8 } });
