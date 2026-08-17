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
import { Wrench, Camera, MapPin, Calendar, CheckCircle2, ShieldCheck, Upload, AlertCircle, ImagePlus } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const ServiceBookingScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const user = useAuthStore((s) => s.user);

  const [catalogServices, setCatalogServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Gold Polishing');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [itemDescription, setItemDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [productPhoto, setProductPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  React.useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/services/catalog');
        if (res.data?.success && res.data.data?.length > 0) {
          setCatalogServices(res.data.data);
          setSelectedServiceId(res.data.data[0].id);
          setServiceType(res.data.data[0].title);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCatalog();
  }, []);

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
        folder: 'arihant_gold_services',
      });

      if (res.data?.success && res.data.url) {
        setProductPhoto(res.data.url);
        if (errorMsg) setErrorMsg('');
      } else {
        Alert.alert('Upload Failed', res.data?.message || 'Error uploading photo to backend');
      }
    } catch (e: any) {
      Alert.alert('Upload Error', 'Failed to upload photo to backend');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBookService = async () => {
    // COMPULSORY check for Product Photo
    if (!productPhoto.trim()) {
      setErrorMsg('COMPULSORY: Product photo URL or image upload is required for polishing/service requests.');
      return;
    }

    if (!name.trim() || !phone.trim() || !itemDescription.trim()) {
      setErrorMsg('Full Name, Phone Number, Item Description, and Product Photo are required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/services/book', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        serviceType,
        itemDescription: itemDescription.trim(),
        pickupAddress: pickupAddress.trim() || 'Store Pickup',
        productPhoto: productPhoto.trim()
      });

      if (res.data?.success && res.data.service) {
        setSuccessBooking(res.data.service);
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit service booking.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Error submitting service booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="BOOKING CONFIRMED" />
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <CheckCircle2 size={54} color={themeColors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: themeColors.foreground }]}>SERVICE BOOKING LOGGED!</Text>
          <Text style={[styles.successSub, { color: themeColors.mutedForeground }]}>
            Your polishing & repair request has been assigned reference ID:
          </Text>

          <View style={[styles.refCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.refLabel, { color: themeColors.mutedForeground }]}>SERVICE NUMBER</Text>
            <Text style={[styles.refVal, { color: themeColors.accent }]}>{successBooking.serviceNumber}</Text>
          </View>

          <Text style={[styles.infoNote, { color: themeColors.mutedForeground }]}>
            Our workshop manager will contact you within 24 hours to coordinate home pickup / store arrival and provide cost estimate.
          </Text>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.doneBtnText, { color: themeColors.accentForeground }]}>RETURN TO HOMEPAGE</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="POLISHING & REPAIRS" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Service Type Selection Chips */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <Wrench size={18} color={themeColors.accent} />
            <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>SELECT SERVICE TYPE</Text>
          </View>

          <View style={styles.typesGrid}>
            {(catalogServices.length > 0
              ? catalogServices.map((sc) => ({
                  id: sc.id,
                  label: sc.title,
                  sub: `Rate: ₹${sc.basePrice} (${sc.estimatedDays || '1-2 Days'}) - ${sc.description || ''}`
                }))
              : [
                  { id: 'sc_polishing', label: '24K Gold Polishing', sub: 'Rate: ₹500 (1-2 Days) - Restore 24K shine' },
                  { id: 'sc_resizing', label: 'Ring & Bangle Resizing', sub: 'Rate: ₹350 (1 Day) - Adjust size' },
                  { id: 'sc_repair', label: 'Clasp & Lock Repair', sub: 'Rate: ₹250 (1 Day) - Fix solders & clasps' },
                  { id: 'sc_engraving', label: 'Custom Laser Engraving', sub: 'Rate: ₹300 (1-2 Days) - Engrave names' }
                ]
            ).map((item) => {
              const isSelected = selectedServiceId === item.id || serviceType === item.label;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  onPress={() => {
                    setSelectedServiceId(item.id);
                    setServiceType(item.label);
                  }}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isSelected ? themeColors.accent : themeColors.inputBg,
                      borderColor: isSelected ? themeColors.accent : themeColors.border
                    }
                  ]}
                >
                  <Text style={[styles.typeLabel, { color: isSelected ? themeColors.accentForeground : themeColors.foreground }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.typeSub, { color: isSelected ? themeColors.accentForeground : themeColors.mutedForeground }]}>
                    {item.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Form Details */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.cardTitle, { color: themeColors.foreground }]}>ORNAMENT & CONTACT DETAILS</Text>

          <View style={styles.formGap}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your Full Name"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={itemDescription}
              onChangeText={setItemDescription}
              placeholder="Item Description (e.g. Gold necklace lost shine, lock clasp broken)"
              multiline
              numberOfLines={3}
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.inputMulti, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TextInput
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Home Address for Courier Pickup"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />

            {/* COMPULSORY PRODUCT PHOTO FIELD */}
            <View style={styles.compulsoryGroup}>
              <View style={styles.compulsoryLabelRow}>
                <Camera size={14} color={themeColors.accent} />
                <Text style={[styles.compulsoryLabel, { color: themeColors.foreground }]}>
                  ORNAMENT PHOTO <Text style={{ color: themeColors.destructive, fontWeight: '800' }}>(COMPULSORY *)</Text>
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                {/* Upload Buttons */}
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

                <TextInput
                  value={productPhoto}
                  onChangeText={(text) => {
                    setProductPhoto(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Or enter Photo URL directly"
                  placeholderTextColor={themeColors.mutedForeground}
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBg,
                      borderColor: !productPhoto.trim() ? themeColors.destructive : themeColors.border,
                      color: themeColors.foreground,
                    },
                  ]}
                />

                {productPhoto ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <Image source={{ uri: productPhoto }} style={{ width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: themeColors.accent }} />
                    <Text style={{ fontSize: 12, color: themeColors.success, fontWeight: '700' }}>✓ Photo Stored on Backend</Text>
                  </View>
                ) : null}
              </View>

              {!productPhoto.trim() ? (
                <Text style={[styles.reqWarnText, { color: themeColors.destructive }]}>
                  * Ornament photo is required so workshop masters can estimate repair cost.
                </Text>
              ) : null}
            </View>

            {errorMsg ? <Text style={[styles.errText, { color: themeColors.destructive }]}>{errorMsg}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={submitting}
              onPress={handleBookService}
              style={[styles.submitBtn, { backgroundColor: themeColors.accent }]}
            >
              {submitting ? (
                <ActivityIndicator color={themeColors.accentForeground} />
              ) : (
                <Text style={[styles.submitBtnText, { color: themeColors.accentForeground }]}>SUBMIT SERVICE REQUEST</Text>
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
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10 },
  typeChip: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4 },
  typeLabel: {
    fontSize: 13,
    fontWeight: '800' },
  typeSub: {
    fontSize: 10 },
  formGap: {
    gap: 10 },
  input: {
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
  compulsoryGroup: {
    gap: 4,
    marginVertical: 4 },
  compulsoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 },
  compulsoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5 },
  reqWarnText: {
    fontSize: 10,
    fontWeight: '600' },
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
