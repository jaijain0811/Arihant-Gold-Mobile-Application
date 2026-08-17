import React, { useState } from 'react';
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
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import api from '../services/api';
import { RotateCcw, Camera, Upload, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const ReturnRequestScreen = ({ route, navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const user = useAuthStore((s) => s.user);

  const initialOrder = route?.params?.order;

  const [orderNumber, setOrderNumber] = useState(initialOrder?.orderNumber || '');
  const [productTitle, setProductTitle] = useState(initialOrder?.items?.[0]?.title || '');
  const [quantity, setQuantity] = useState('1');
  const [refundAmount, setRefundAmount] = useState(initialOrder?.totalAmount?.toString() || '');
  const [reason, setReason] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successReturn, setSuccessReturn] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePickPhoto = async (useCamera = false) => {
    try {
      setUploadingPhoto(true);
      const picker = useCamera ? launchCamera : launchImageLibrary;
      const result = await picker({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.7,
      });

      if (result.didCancel || !result.assets?.[0]) {
        setUploadingPhoto(false);
        return;
      }

      const asset = result.assets[0];
      const base64Str = asset.base64
        ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      const res = await api.post('/media/upload', {
        fileStr: base64Str,
        folder: 'arihant_gold_returns',
      });

      if (res.data?.success && res.data.url) {
        setPhotoUrl(res.data.url);
        if (errorMsg) setErrorMsg('');
      } else {
        Alert.alert('Upload Failed', res.data?.message || 'Error uploading defect photo.');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', 'Failed to upload photo to server.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!productTitle.trim() || !reason.trim()) {
      setErrorMsg('Product Title and Reason for Return are required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/returns/request', {
        orderId: orderNumber.trim(),
        productTitle: productTitle.trim(),
        quantity: Number(quantity) || 1,
        refundAmount: Number(refundAmount) || 0,
        reason: reason.trim(),
        customerName: customerName.trim() || user?.name || 'Customer',
        customerPhone: customerPhone.trim() || user?.phone || '8591417443',
        customerEmail: user?.email || '',
        photoUrl: photoUrl.trim()
      });

      if (res.data?.success && res.data.data) {
        setSuccessReturn(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit return request.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Error submitting return request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successReturn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="RETURN SUBMITTED" />
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <CheckCircle2 size={54} color={themeColors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: themeColors.foreground }]}>RETURN REQUEST FILED!</Text>
          <Text style={[styles.successSub, { color: themeColors.mutedForeground }]}>
            Your return request reference code is:
          </Text>

          <View style={[styles.refCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.refLabel, { color: themeColors.mutedForeground }]}>RETURN REF NUMBER</Text>
            <Text style={[styles.refVal, { color: themeColors.accent }]}>{successReturn.returnNumber}</Text>
          </View>

          <Text style={[styles.infoNote, { color: themeColors.mutedForeground }]}>
            Upon inspection & approval by Admin, your refund amount (₹{successReturn.refundAmount}) will be credited automatically to your Account Ledger due balance.
          </Text>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => navigation.navigate('CustomerLedger')}
          >
            <Text style={[styles.doneBtnText, { color: themeColors.accentForeground }]}>VIEW MY ACCOUNT LEDGER</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="PRODUCT RETURN REQUEST" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <RotateCcw size={18} color={themeColors.accent} />
            <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>REQUEST PRODUCT RETURN & CREDIT</Text>
          </View>

          <View style={styles.formGap}>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Your Full Name"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="10-digit Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={orderNumber}
              onChangeText={setOrderNumber}
              placeholder="Order Number / Invoice Ref (Optional)"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={productTitle}
              onChangeText={setProductTitle}
              placeholder="Product Name / Item Description"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Quantity"
                keyboardType="numeric"
                placeholderTextColor={themeColors.mutedForeground}
                style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
              />
              <TextInput
                value={refundAmount}
                onChangeText={setRefundAmount}
                placeholder="Refund Amount (₹)"
                keyboardType="numeric"
                placeholderTextColor={themeColors.mutedForeground}
                style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
              />
            </View>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason for Return / Damage Details"
              multiline
              numberOfLines={3}
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.inputMulti, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />

            {/* DEFECT / ITEM PHOTO UPLOADER */}
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>
                ITEM / DEFECT PHOTO (OPTIONAL)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={uploadingPhoto}
                  onPress={() => handlePickPhoto(false)}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.card,
                    borderWidth: 1,
                    borderColor: themeColors.accent,
                    borderRadius: 8,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color={themeColors.accent} />
                  ) : (
                    <>
                      <Upload size={16} color={themeColors.accent} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.accent }}>
                        Upload from Device
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={uploadingPhoto}
                  onPress={() => handlePickPhoto(true)}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.card,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    borderRadius: 8,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Camera size={16} color={themeColors.foreground} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: themeColors.foreground }}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
              </View>

              {photoUrl ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Image source={{ uri: photoUrl }} style={{ width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: themeColors.accent }} />
                  <Text style={{ fontSize: 12, color: themeColors.success, fontWeight: '700' }}>✓ Defect Photo Attached</Text>
                </View>
              ) : null}
            </View>

            {errorMsg ? <Text style={[styles.errText, { color: themeColors.destructive }]}>{errorMsg}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={submitting}
              onPress={handleSubmitReturn}
              style={[styles.submitBtn, { backgroundColor: themeColors.accent }]}
            >
              {submitting ? (
                <ActivityIndicator color={themeColors.accentForeground} />
              ) : (
                <Text style={[styles.submitBtnText, { color: themeColors.accentForeground }]}>SUBMIT RETURN REQUEST</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16,
    gap: 16 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  formGap: {
    gap: 10 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13 },
  halfInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13 },
  inputMulti: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top' },
  errText: {
    fontSize: 12,
    fontWeight: '600' },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6 },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  successScroll: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20 },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6 },
  successSub: {
    fontSize: 12,
    textAlign: 'center' },
  refCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    marginVertical: 16 },
  refLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1 },
  refVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4 },
  infoNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24 },
  doneBtn: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%' },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 } });
