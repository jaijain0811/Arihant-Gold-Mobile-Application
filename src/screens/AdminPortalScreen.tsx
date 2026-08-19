import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { accessCodeService } from '../services/accessCodeService';
import { productService } from '../services/productService';
import { bannerService } from '../services/bannerService';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessCode, Product, Banner, Order, AppSettings, Category } from '../types';
import {
  Shield,
  KeyRound,
  Package,
  Image as ImageIcon,
  ShoppingBag,
  Settings,
  BarChart3,
  Trash2,
  Lock,
  Mail,
  Key,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Wrench,
  MessageSquare,
  Plus,
  Layers,
  Users,
  RotateCcw,
  Tag,
  Upload,
  Camera as CameraIcon,
  Edit3,
  Truck,
  ExternalLink
} from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export const AdminPortalScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const { user, setAuth } = useAuthStore();

  const isAdminAuthenticated = user?.role === 'admin' && (
    user?.email?.toLowerCase() === 'arihantgold20@gmail.com' ||
    user?.email?.toLowerCase() === 'jaijain1466@gmail.com'
  );

  const [adminEmail, setAdminEmail] = useState('jaijain1466@gmail.com');
  const [adminPassword, setAdminPassword] = useState('jaijain0811');
  const [adminUniqueId, setAdminUniqueId] = useState('0811');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // All 13 Admin Tabs matching Admin Web Portal
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'pos' | 'parties' | 'products' | 'categories' | 'returns' | 'services' | 'coupons' | 'orders' | 'enquiries' | 'codes' | 'banners' | 'settings'
  >('analytics');
  const [loading, setLoading] = useState(false);

  // Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [serviceCatalog, setServiceCatalog] = useState<any[]>([]);

  // Search & Filter Query States
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [billSearchQuery, setBillSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Printable Modals State
  const [printableInvoice, setPrintableInvoice] = useState<any>(null);
  const [printableStatement, setPrintableStatement] = useState<any>(null);

  // Image Upload Helper for Admin Forms
  const [uploadingImg, setUploadingImg] = useState(false);
  const uploadImageFromDevice = async (onSuccess: (url: string) => void, useCamera = false) => {
    try {
      setUploadingImg(true);
      const picker = useCamera ? launchCamera : launchImageLibrary;
      const result = await picker({ mediaType: 'photo', includeBase64: true, quality: 0.7 });
      if (result.didCancel || !result.assets?.[0]) {
        setUploadingImg(false);
        return;
      }
      const asset = result.assets[0];
      const base64Str = asset.base64 ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}` : asset.uri;
      const res = await api.post('/media/upload', { fileStr: base64Str, folder: 'arihant_gold_admin' });
      if (res.data?.success && res.data.url) {
        onSuccess(res.data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingImg(false);
    }
  };

  // POS Form State
  const [posPartyId, setPosPartyId] = useState('');
  const [posName, setPosName] = useState('');
  const [posPhone, setPosPhone] = useState('');
  const [posPayment, setPosPayment] = useState('cash_pos');
  const [posPaymentStatus, setPosPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [posDiscount, setPosDiscount] = useState('0');
  const [selectedPosProduct, setSelectedPosProduct] = useState<any>(null);
  const [posBillItems, setPosBillItems] = useState<Array<{ productId: string; title: string; image?: string; price: number; quantity: number }>>([]);
  const [posItemQty, setPosItemQty] = useState('1');
  const [posItemCustomPrice, setPosItemCustomPrice] = useState('');

  // Product Form Extended State
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pComparePrice, setPComparePrice] = useState('');
  const [pCategory, setPCategory] = useState('Necklaces');
  const [pStock, setPStock] = useState('10');
  const [pSkuCode, setPSkuCode] = useState('');
  const [pStyle, setPStyle] = useState('Forming Jewel');
  const [pFeatured, setPFeatured] = useState('Yes');
  const [pBestSeller, setPBestSeller] = useState('No');
  const [pPromotionDeal, setPPromotionDeal] = useState('No Promotion');
  const [pNewArrival, setPNewArrival] = useState('No');
  const [pImgUrl, setPImgUrl] = useState('');
  const [pDescription, setPDescription] = useState('');

  // Design Variants List for Product
  const [pDesigns, setPDesigns] = useState<Array<{ code: string; title: string; image: string; price: string }>>([
    { code: 'DSG-001', title: 'Peacock Royal Design', image: '', price: '' }
  ]);

  const addDesignField = () => {
    setPDesigns([...pDesigns, { code: `DSG-00${pDesigns.length + 1}`, title: `Design ${pDesigns.length + 1}`, image: '', price: '' }]);
  };

  // Party Form Extended State
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyEmail, setPartyEmail] = useState('');
  const [partyCity, setPartyCity] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [partyOpeningBal, setPartyOpeningBal] = useState('0');

  // Party Payment State
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyPayAmount, setPartyPayAmount] = useState('');
  const [partyPayMode, setPartyPayMode] = useState('Cash');
  const [partyPayNotes, setPartyPayNotes] = useState('');

  // Coupon Extended State
  const [couponCodeText, setCouponCodeText] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponPercentText, setCouponPercentText] = useState('10');
  const [couponMinOrder, setCouponMinOrder] = useState('0');

  // Category Extended State
  const [catNameText, setCatNameText] = useState('');
  const [catSlugText, setCatSlugText] = useState('');
  const [catDisplayOrder, setCatDisplayOrder] = useState('1');
  const [catStatus, setCatStatus] = useState('Active');
  const [catShowOnHome, setCatShowOnHome] = useState('Yes');
  const [catPhoto1, setCatPhoto1] = useState('');
  const [catPhoto2, setCatPhoto2] = useState('');

  const handleCreateParty = async () => {
    if (!partyName.trim() || !partyPhone.trim()) return;
    try {
      setLoading(true);
      await api.post('/pos/admin/parties', {
        name: partyName.trim(),
        phone: partyPhone.trim(),
        email: partyEmail.trim().toLowerCase(),
        address: partyAddress.trim() || partyCity.trim() || 'Local Store',
        gstin: partyGstin.trim(),
        openingBalance: Number(partyOpeningBal) || 0
      });
      setPartyName('');
      setPartyPhone('');
      setPartyEmail('');
      setPartyCity('');
      setPartyAddress('');
      setPartyGstin('');
      setPartyOpeningBal('0');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPartyPayment = async (partyId: string) => {
    if (!partyPayAmount || Number(partyPayAmount) <= 0) return;
    try {
      setLoading(true);
      await api.post('/pos/admin/parties/payment', {
        partyId,
        amount: Number(partyPayAmount),
        paymentMethod: partyPayMode,
        notes: partyPayNotes.trim() || 'Party Ledger Payment Credit'
      });
      setPartyPayAmount('');
      setPartyPayNotes('');
      setSelectedPartyId('');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!couponCodeText.trim() || !couponPercentText) return;
    try {
      setLoading(true);
      await api.post('/coupons/admin', {
        code: couponCodeText.trim().toUpperCase(),
        discountType: couponType,
        discountValue: Number(couponPercentText) || 10,
        minPurchaseAmount: Number(couponMinOrder) || 0
      });
      setCouponCodeText('');
      setCouponPercentText('10');
      setCouponMinOrder('0');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!catNameText.trim()) return;
    try {
      setLoading(true);
      await api.post('/categories', {
        name: catNameText.trim(),
        slug: catSlugText.trim() || catNameText.trim().toLowerCase().replace(/\s+/g, '-'),
        displayOrder: Number(catDisplayOrder) || 1,
        status: catStatus,
        showOnHome: catShowOnHome,
        image: catPhoto1.trim(),
        image2: catPhoto2.trim()
      });
      setCatNameText('');
      setCatSlugText('');
      setCatPhoto1('');
      setCatPhoto2('');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentMethod = async (key: 'cod' | 'qrCode' | 'payLater') => {
    if (!settings) return;
    try {
      setLoading(true);
      const updated = {
        ...settings,
        paymentMethods: {
          ...settings.paymentMethods,
          [key]: {
            ...settings.paymentMethods[key],
            enabled: !settings.paymentMethods[key].enabled
          }
        }
      };
      await api.put('/settings', updated);
      setSettings(updated);
    } catch (e) {
      console.error('Error toggling payment method:', e);
    } finally {
      setLoading(false);
    }
  };

  // Service Catalog Rate Form State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDays, setSrvDays] = useState('1-2 Days');

  // Return Creation Form State
  const [retCustName, setRetCustName] = useState('');
  const [retCustPhone, setRetCustPhone] = useState('');
  const [retProdTitle, setRetProdTitle] = useState('');
  const [retQty, setRetQty] = useState('1');
  const [retRefundAmt, setRetRefundAmt] = useState('');
  const [retReason, setRetReason] = useState('');

  const handleEditServiceCatalog = (sc: any) => {
    setEditingServiceId(sc.id);
    setSrvTitle(sc.title || '');
    setSrvDesc(sc.description || '');
    setSrvPrice(sc.basePrice?.toString() || '');
    setSrvDays(sc.estimatedDays || '1-2 Days');
  };

  const handleCancelServiceEdit = () => {
    setEditingServiceId(null);
    setSrvTitle('');
    setSrvDesc('');
    setSrvPrice('');
    setSrvDays('1-2 Days');
  };

  const handleCreateServiceRate = async () => {
    if (!srvTitle.trim() || !srvPrice) return;
    try {
      setLoading(true);
      if (editingServiceId) {
        await api.put(`/services/admin/catalog/${editingServiceId}`, {
          title: srvTitle.trim(),
          description: srvDesc.trim(),
          basePrice: Number(srvPrice),
          estimatedDays: srvDays
        });
        setEditingServiceId(null);
      } else {
        await api.post('/services/admin/catalog', {
          title: srvTitle.trim(),
          description: srvDesc.trim(),
          basePrice: Number(srvPrice),
          estimatedDays: srvDays
        });
      }
      setSrvTitle('');
      setSrvDesc('');
      setSrvPrice('');
      setSrvDays('1-2 Days');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServiceCatalog = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/services/admin/catalog/${id}`);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServiceBooking = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/services/admin/booking/${id}`);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Order Tracking Form State
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [ordCourierPartner, setOrdCourierPartner] = useState('');
  const [ordTrackingNumber, setOrdTrackingNumber] = useState('');
  const [ordTrackingUrl, setOrdTrackingUrl] = useState('');
  const [ordEstimatedDelivery, setOrdEstimatedDelivery] = useState('');
  const [ordTrackingNotes, setOrdTrackingNotes] = useState('');
  const [ordStatus, setOrdStatus] = useState('Shipped');
  const [ordPaymentStatus, setOrdPaymentStatus] = useState('Paid');

  const handleOpenOrderTracking = (o: any) => {
    setSelectedTrackingOrderId(o.id);
    setOrdCourierPartner(o.courierPartner || 'Delhivery Express');
    setOrdTrackingNumber(o.trackingNumber || '');
    setOrdTrackingUrl(o.trackingUrl || '');
    setOrdEstimatedDelivery(o.estimatedDelivery || '2-3 Business Days');
    setOrdTrackingNotes(o.notes || '');
    setOrdStatus(o.status || 'Shipped');
    setOrdPaymentStatus(o.paymentStatus || 'Paid');
  };

  const handleSaveOrderTracking = async () => {
    if (!selectedTrackingOrderId) return;
    try {
      setLoading(true);
      await api.put(`/orders/admin/status/${selectedTrackingOrderId}`, {
        status: ordStatus,
        paymentStatus: ordPaymentStatus,
        courierPartner: ordCourierPartner.trim(),
        trackingNumber: ordTrackingNumber.trim(),
        trackingUrl: ordTrackingUrl.trim(),
        estimatedDelivery: ordEstimatedDelivery.trim(),
        notes: ordTrackingNotes.trim()
      });
      setSelectedTrackingOrderId(null);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReturn = async () => {
    if (!retCustName.trim() || !retProdTitle.trim() || !retRefundAmt) return;
    try {
      setLoading(true);
      await api.post('/returns/admin/create', {
        customerName: retCustName.trim(),
        customerPhone: retCustPhone.trim(),
        productTitle: retProdTitle.trim(),
        quantity: Number(retQty) || 1,
        refundAmount: Number(retRefundAmt),
        reason: retReason.trim()
      });
      setRetCustName('');
      setRetCustPhone('');
      setRetProdTitle('');
      setRetRefundAmt('');
      setRetReason('');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Banner Form State
  const [bTitle, setBTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bImgUrl, setBImgUrl] = useState('');
  const [bIsHero, setBIsHero] = useState(true);

  // Code Form State
  const [newCode, setNewCode] = useState('');
  const [newCodeLabel, setNewCodeLabel] = useState('');

  const handleAdminLogin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim() || !adminUniqueId.trim()) {
      setAuthError('Email, Password, and Unique ID are required.');
      return;
    }

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanKey = adminUniqueId.trim();

    if (
      (cleanEmail !== 'jaijain1466@gmail.com' && cleanEmail !== 'arihantgold20@gmail.com') ||
      (cleanKey !== '0811' && cleanKey !== '07154d2e64c101d301f4b8d03b6810653ff924a5425d7480dd8f1327ec939c7d')
    ) {
      setAuthError('Invalid Master Admin credentials or Unique ID.');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError('');

      await AsyncStorage.setItem('admin_passkey', '07154d2e64c101d301f4b8d03b6810653ff924a5425d7480dd8f1327ec939c7d');
      await AsyncStorage.setItem('user_access_code', '0811');

      const result = await authService.login(cleanEmail, adminPassword.trim());
      if (result.user && result.token) {
        await setAuth(result.user, result.token);
      } else {
        setAuthError(result.message || 'Authentication failed.');
      }
    } catch (e: any) {
      setAuthError(e.response?.data?.message || 'Invalid Master Admin credentials.');
    } finally {
      setAuthLoading(false);
    }
  };


  const loadData = async () => {
    if (!isAdminAuthenticated) return;
    try {
      setLoading(true);
      if (activeTab === 'analytics') {
        const res = await adminService.getAnalytics();
        if (res.success) setAnalytics(res.data);
      } else if (activeTab === 'pos') {
        const [prodRes, partyRes] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          api.get('/pos/admin/parties')
        ]);
        if (prodRes.success) setProducts(prodRes.data || []);
        if (partyRes.data?.success) setParties(partyRes.data.parties || partyRes.data.data || []);
      } else if (activeTab === 'parties') {
        const res = await api.get('/pos/admin/parties');
        if (res.data?.success) setParties(res.data.parties || []);
      } else if (activeTab === 'services') {
        const [sRes, catRes] = await Promise.all([
          api.get('/services/admin/all'),
          api.get('/services/catalog')
        ]);
        if (sRes.data?.success) setServices(sRes.data.bookings || []);
        if (catRes.data?.success) setServiceCatalog(catRes.data.data || []);
      } else if (activeTab === 'enquiries') {
        const res = await api.get('/enquiries/admin/all');
        if (res.data?.success) setEnquiries(res.data.enquiries || []);
      } else if (activeTab === 'codes') {
        const res = await accessCodeService.getAllCodes();
        if (res.success) setAccessCodes(res.data || []);
      } else if (activeTab === 'products') {
        const [pRes, cRes] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          productService.getCategories()
        ]);
        if (pRes.success) setProducts(pRes.data || []);
        if (cRes.success) setCategories(cRes.data || []);
      } else if (activeTab === 'categories') {
        const cRes = await productService.getCategories();
        if (cRes.success) setCategories(cRes.data || []);
      } else if (activeTab === 'returns') {
        const res = await api.get('/returns/admin/all');
        if (res.data?.success) setReturnsList(res.data.data || []);
      } else if (activeTab === 'coupons') {
        const res = await api.get('/coupons/admin/all');
        if (res.data?.success) setCoupons(res.data.data || []);
      } else if (activeTab === 'banners') {
        const res = await bannerService.getAllAdminBanners();
        if (res.success) setBanners(res.data || []);
      } else if (activeTab === 'orders') {
        const res = await adminService.getAllOrders();
        if (res.success) setOrders(res.orders || []);
      } else if (activeTab === 'settings') {
        const res = await orderService.getSettings();
        if (res.success) setSettings(res.data);
      }
    } catch (e) {
      console.error('Admin data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, isAdminAuthenticated]);

  // POS Multi-item & Piece actions
  const handleAddPosItem = () => {
    if (!selectedPosProduct) return;
    const qty = Math.max(1, parseInt(posItemQty) || 1);
    const price = posItemCustomPrice ? parseFloat(posItemCustomPrice) : selectedPosProduct.price;

    const existingIndex = posBillItems.findIndex(item => item.productId === selectedPosProduct.id);
    if (existingIndex !== -1) {
      const updated = [...posBillItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].price = price;
      setPosBillItems(updated);
    } else {
      setPosBillItems([
        ...posBillItems,
        {
          productId: selectedPosProduct.id,
          title: selectedPosProduct.title,
          image: selectedPosProduct.images?.[0] || '',
          price: price,
          quantity: qty
        }
      ]);
    }
    setSelectedPosProduct(null);
    setPosItemQty('1');
    setPosItemCustomPrice('');
  };

  const handleRemovePosItem = (index: number) => {
    setPosBillItems(posBillItems.filter((_, i) => i !== index));
  };

  const handleUpdatePosItemQty = (index: number, delta: number) => {
    const updated = [...posBillItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      setPosBillItems(posBillItems.filter((_, i) => i !== index));
    } else {
      updated[index].quantity = newQty;
      setPosBillItems(updated);
    }
  };

  // Create POS Billing Invoice
  const handleCreatePOSInvoice = async () => {
    let finalItems = [...posBillItems];
    if (finalItems.length === 0 && selectedPosProduct) {
      const qty = Math.max(1, parseInt(posItemQty) || 1);
      const price = posItemCustomPrice ? parseFloat(posItemCustomPrice) : selectedPosProduct.price;
      finalItems = [{
        productId: selectedPosProduct.id,
        title: selectedPosProduct.title,
        image: selectedPosProduct.images?.[0] || '',
        price: price,
        quantity: qty
      }];
    }

    if (finalItems.length === 0) return;

    try {
      setLoading(true);
      const res = await api.post('/pos/admin/invoice', {
        partyId: posPartyId || undefined,
        customerName: posName.trim() || 'Walk-in Customer',
        customerPhone: posPhone.trim() || '8591417443',
        paymentMethod: posPayment,
        paymentStatus: posPaymentStatus,
        discount: Number(posDiscount) || 0,
        items: finalItems
      });
      setPosName('');
      setPosPhone('');
      setPosPartyId('');
      setSelectedPosProduct(null);
      setPosBillItems([]);
      setPosDiscount('0');
      setPosItemQty('1');
      setPosItemCustomPrice('');
      if (res.data?.invoice) {
        setPrintableInvoice(res.data.invoice);
      }
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Service Tracking Status Update
  const handleUpdateServiceTracking = async (id: string, status: string, trackingNotes: string) => {
    try {
      await api.put(`/services/admin/tracking/${id}`, { status, trackingNotes });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Enquiry Status Update
  const handleUpdateEnquiryStatus = async (id: string, status: string) => {
    try {
      await api.put(`/enquiries/admin/status/${id}`, { status });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Code Creation
  const handleCreateCode = async () => {
    if (!newCode.trim()) return;
    try {
      setLoading(true);
      await accessCodeService.createCode({ code: newCode.trim(), label: newCodeLabel.trim() || 'Partner' });
      setNewCode('');
      setNewCodeLabel('');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCode = async (id: string, current: boolean) => {
    await accessCodeService.updateCode(id, { isActive: !current });
    loadData();
  };

  const handleDeleteCode = async (id: string) => {
    await accessCodeService.deleteCode(id);
    loadData();
  };

  // Product Creation with Designs & Full Attributes
  const handleCreateProduct = async () => {
    if (!pTitle.trim() || !pPrice) return;
    try {
      setLoading(true);
      const designsPayload = pDesigns
        .filter(d => d.title.trim())
        .map(d => ({
          code: d.code.trim(),
          title: d.title.trim(),
          image: d.image.trim() || pImgUrl.trim() || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60',
          price: d.price ? Number(d.price) : Number(pPrice)
        }));

      await productService.createProduct({
        title: pTitle.trim(),
        price: Number(pPrice),
        compareAtPrice: pComparePrice ? Number(pComparePrice) : Number(pPrice),
        category: pCategory,
        stock: Number(pStock) || 10,
        skuCode: pSkuCode.trim() || `NKL-${Math.floor(100 + Math.random() * 900)}`,
        jewelleryStyle: pStyle,
        isFeatured: pFeatured,
        isBestSeller: pBestSeller,
        promotionDeal: pPromotionDeal,
        isNewArrival: pNewArrival,
        images: [pImgUrl.trim() || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60'],
        description: pDescription.trim(),
        designs: designsPayload
      });

      setPTitle('');
      setPPrice('');
      setPComparePrice('');
      setPImgUrl('');
      setPDescription('');
      setPSkuCode('');
      setPDesigns([{ code: 'DSG-001', title: 'Peacock Royal Design', image: '', price: '' }]);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    loadData();
  };

  // Banner Creation & Deletion
  const handleCreateBanner = async () => {
    if (!bTitle.trim() || !bImgUrl.trim()) return;
    try {
      setLoading(true);
      await bannerService.createBanner({
        title: bTitle.trim(),
        subtitle: bSubtitle.trim(),
        image: bImgUrl.trim(),
        isHero: bIsHero,
        badgeText: bIsHero ? 'HERO FEATURED' : 'PROMO POSTER'
      });
      setBTitle('');
      setBSubtitle('');
      setBImgUrl('');
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await bannerService.deleteBanner(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteParty = async (id: string) => {
    try {
      await api.delete(`/pos/admin/parties/${id}`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.delete(`/coupons/admin/${id}`);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateReturnStatus = async (id: string, status: string, autoRestock: boolean = false) => {
    try {
      await api.put(`/returns/admin/status/${id}`, { status, autoRestock });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await adminService.updateOrderStatus(id, { status });
    loadData();
  };

  if (!isAdminAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="ADMIN PORTAL" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authLockInner}>
          <ScrollView contentContainerStyle={styles.authLockScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.authLockCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={[styles.lockIconBg, { backgroundColor: themeColors.inputBg }]}>
                <ShieldCheck size={36} color={themeColors.accent} />
              </View>

              <Text style={[styles.authLockTitle, { color: themeColors.foreground }]}>MASTER ADMIN PORTAL</Text>
              <Text style={[styles.authLockSub, { color: themeColors.mutedForeground }]}>
                Enter Master Admin credentials and Unique ID to access management settings.
              </Text>

              <View style={styles.formGap}>
                <View style={styles.fieldBlock}>
                  <Text style={[styles.label, { color: themeColors.mutedForeground }]}>ADMIN EMAIL</Text>
                  <View style={[styles.inputRow, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                    <Mail size={16} color={themeColors.accent} />
                    <TextInput
                      value={adminEmail}
                      onChangeText={setAdminEmail}
                      placeholder="Enter Master Admin Email"
                      placeholderTextColor={themeColors.mutedForeground}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.inputFlex, { color: themeColors.foreground }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={[styles.label, { color: themeColors.mutedForeground }]}>ADMIN PASSWORD</Text>
                  <View style={[styles.inputRow, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                    <Lock size={16} color={themeColors.accent} />
                    <TextInput
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="Enter Master Password"
                      placeholderTextColor={themeColors.mutedForeground}
                      secureTextEntry
                      style={[styles.inputFlex, { color: themeColors.foreground }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={[styles.label, { color: themeColors.mutedForeground }]}>UNIQUE ADMIN SECURITY KEY</Text>
                  <View style={[styles.inputRow, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                    <Key size={16} color={themeColors.accent} />
                    <TextInput
                      value={adminUniqueId}
                      onChangeText={setAdminUniqueId}
                      placeholder="Enter Security Key"
                      placeholderTextColor={themeColors.mutedForeground}
                      secureTextEntry
                      style={[styles.inputFlex, { color: themeColors.foreground }]}
                    />
                  </View>
                </View>

                {authError ? <Text style={[styles.authErrText, { color: themeColors.destructive }]}>{authError}</Text> : null}

                <TouchableOpacity
                  activeOpacity={0.88}
                  disabled={authLoading}
                  onPress={handleAdminLogin}
                  style={[styles.authSubmitBtn, { backgroundColor: themeColors.accent }]}
                >
                  {authLoading ? (
                    <ActivityIndicator color={themeColors.accentForeground} />
                  ) : (
                    <View style={styles.btnRow}>
                      <LogIn size={16} color={themeColors.accentForeground} />
                      <Text style={[styles.authSubmitText, { color: themeColors.accentForeground }]}>
                        UNLOCK MASTER ADMIN
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="MASTER ADMIN" />

      {/* Navigation Tabs Bar - 13 Admin Tabs matching Admin Web Portal */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'pos', label: 'POS Billing', icon: Receipt },
            { id: 'parties', label: 'Parties & Ledger', icon: Users },
            { id: 'products', label: 'Products & Designs', icon: Package },
            { id: 'categories', label: 'Categories (Photo 2)', icon: Layers },
            { id: 'returns', label: 'Product Returns', icon: RotateCcw },
            { id: 'services', label: 'Services Tracking', icon: Wrench },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'orders', label: 'Order Tracking', icon: ShoppingBag },
            { id: 'enquiries', label: 'Store Enquiries', icon: MessageSquare },
            { id: 'codes', label: 'Access IDs', icon: KeyRound },
            { id: 'banners', label: 'Banners & Posters', icon: ImageIcon },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveTab(item.id as any)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isActive ? themeColors.accent : themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Icon size={14} color={isActive ? themeColors.accentForeground : themeColors.foreground} />
                <Text style={[styles.tabText, { color: isActive ? themeColors.accentForeground : themeColors.foreground }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.accent} style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && analytics && (
              <View style={styles.tabContent}>
                <View style={styles.metricsGrid}>
                  <View style={[styles.metricCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.metricLabel, { color: themeColors.mutedForeground }]}>Total Sales Revenue</Text>
                    <Text style={[styles.metricVal, { color: themeColors.accent }]}>₹{analytics.totalRevenue.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.metricLabel, { color: themeColors.mutedForeground }]}>Total Orders</Text>
                    <Text style={[styles.metricVal, { color: themeColors.foreground }]}>{analytics.totalOrders}</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.metricLabel, { color: themeColors.mutedForeground }]}>Active Access Codes</Text>
                    <Text style={[styles.metricVal, { color: themeColors.accent }]}>{analytics.activeAccessCodes}</Text>
                  </View>
                  <View style={[styles.metricCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.metricLabel, { color: themeColors.mutedForeground }]}>Total Products</Text>
                    <Text style={[styles.metricVal, { color: themeColors.foreground }]}>{analytics.totalProducts}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* POS & BILLING TAB */}
            {activeTab === 'pos' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>GENERATE POS OFFLINE / PARTY BILLING INVOICE</Text>

                  {/* Registered Party Account Selector */}
                  <Text style={[styles.label, { color: themeColors.accent }]}>1. SELECT REGISTERED PARTY ACCOUNT (OPTIONAL)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setPosPartyId('');
                        setPosName('');
                        setPosPhone('');
                      }}
                      style={[styles.posProdChip, { backgroundColor: !posPartyId ? themeColors.accent : themeColors.inputBg }]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: !posPartyId ? themeColors.accentForeground : themeColors.foreground }}>
                        👤 Retail Customer
                      </Text>
                    </TouchableOpacity>
                    {parties.map((p) => {
                      const isSel = posPartyId === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setPosPartyId(p.id);
                            setPosName(p.name);
                            setPosPhone(p.phone);
                          }}
                          style={[styles.posProdChip, { backgroundColor: isSel ? themeColors.accent : themeColors.inputBg }]}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: isSel ? themeColors.accentForeground : themeColors.foreground }}>
                            🏢 {p.name} (Due: ₹{p.currentBalance || 0})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TextInput
                    value={posName}
                    onChangeText={setPosName}
                    placeholder="Customer / Party Full Name"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={posPhone}
                    onChangeText={setPosPhone}
                    placeholder="Customer Phone Number"
                    keyboardType="phone-pad"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />

                  {/* Payment Mode Selector */}
                  <Text style={[styles.label, { color: themeColors.mutedForeground, marginTop: 4 }]}>2. PAYMENT MODE</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { key: 'cash_pos', label: '💵 Cash' },
                      { key: 'upi_pos', label: '📱 QR UPI' },
                      { key: 'card_pos', label: '💳 Card' },
                      { key: 'pay_later', label: '⏳ Party Credit' }
                    ].map((pm) => (
                      <TouchableOpacity
                        key={pm.key}
                        onPress={() => setPosPayment(pm.key)}
                        style={[styles.statusBtn, { backgroundColor: posPayment === pm.key ? themeColors.accent : themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: posPayment === pm.key ? themeColors.accentForeground : themeColors.foreground }}>
                          {pm.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Payment Status Selector */}
                  <Text style={[styles.label, { color: themeColors.mutedForeground, marginTop: 4 }]}>3. PAYMENT STATUS</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['Paid', 'Unpaid', 'Partial'] as const).map((st) => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setPosPaymentStatus(st)}
                        style={[styles.statusBtn, { flex: 1, alignItems: 'center', backgroundColor: posPaymentStatus === st ? themeColors.accent : themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: posPaymentStatus === st ? themeColors.accentForeground : themeColors.foreground }}>
                          {st.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    value={posDiscount}
                    onChangeText={setPosDiscount}
                    placeholder="Discount Amount (₹)"
                    keyboardType="numeric"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground, marginTop: 4 }]}
                  />

                  {/* ITEM & PIECES ADDER SECTION */}
                  <Text style={[styles.label, { color: themeColors.accent, marginTop: 8 }]}>
                    4. CHOOSE PRODUCT & PIECES (MULTIPLE ITEMS / PC)
                  </Text>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {products.map((p) => {
                      const isSel = selectedPosProduct?.id === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setSelectedPosProduct(p);
                            setPosItemCustomPrice(p.price?.toString() || '');
                          }}
                          style={[styles.posProdChip, { backgroundColor: isSel ? themeColors.accent : themeColors.inputBg, borderColor: themeColors.border }]}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: isSel ? themeColors.accentForeground : themeColors.foreground }}>
                            {p.title} (₹{p.price})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {selectedPosProduct && (
                    <View style={{ gap: 8, marginTop: 8, padding: 10, backgroundColor: themeColors.inputBg, borderRadius: 8, borderWidth: 1, borderColor: themeColors.border }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accent }}>
                        Selected: {selectedPosProduct.title}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                          value={posItemQty}
                          onChangeText={setPosItemQty}
                          placeholder="Pieces (PC)"
                          keyboardType="numeric"
                          placeholderTextColor={themeColors.mutedForeground}
                          style={[styles.halfInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                        />
                        <TextInput
                          value={posItemCustomPrice}
                          onChangeText={setPosItemCustomPrice}
                          placeholder="Rate (₹/pc)"
                          keyboardType="numeric"
                          placeholderTextColor={themeColors.mutedForeground}
                          style={[styles.halfInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={handleAddPosItem}
                        style={{ backgroundColor: themeColors.accent, paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accentForeground }}>+ ADD ITEM TO BILL</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ADDED ITEMS LIST IN CURRENT BILL */}
                  {posBillItems.length > 0 && (
                    <View style={{ marginTop: 12, gap: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>
                        ITEMS IN CURRENT BILL ({posBillItems.length})
                      </Text>
                      {posBillItems.map((item, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: themeColors.inputBg, borderRadius: 6, borderWidth: 1, borderColor: themeColors.border }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.foreground }}>{item.title}</Text>
                            <Text style={{ fontSize: 10, color: themeColors.accent, fontWeight: '700' }}>
                              ₹{item.price} x {item.quantity} pc = ₹{item.price * item.quantity}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <TouchableOpacity onPress={() => handleUpdatePosItemQty(idx, -1)} style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: themeColors.card, borderRadius: 4 }}>
                              <Text style={{ fontSize: 12, fontWeight: '900', color: themeColors.foreground }}>-</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>{item.quantity} pc</Text>
                            <TouchableOpacity onPress={() => handleUpdatePosItemQty(idx, 1)} style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: themeColors.card, borderRadius: 4 }}>
                              <Text style={{ fontSize: 12, fontWeight: '900', color: themeColors.foreground }}>+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemovePosItem(idx)} style={{ paddingLeft: 6 }}>
                              <Trash2 size={14} color={themeColors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.mutedForeground }}>
                          Total Pieces: {posBillItems.reduce((s, i) => s + i.quantity, 0)} pc
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: themeColors.accent }}>
                          Gross Total: ₹{posBillItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={handleCreatePOSInvoice}
                    disabled={posBillItems.length === 0 && !selectedPosProduct}
                    style={[styles.addBtn, { backgroundColor: themeColors.accent, marginTop: 12 }]}
                  >
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>GENERATE POS INVOICE & PRINT RECEIPT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SERVICE TRACKING & CATALOG TAB */}
            {activeTab === 'services' && (
              <View style={styles.tabContent}>
                {/* Add / Edit Service Rate Form */}
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>
                    {editingServiceId ? 'EDIT SERVICE RATE IN CATALOG' : 'ADD SERVICE RATE TO CATALOG'}
                  </Text>
                  <TextInput
                    value={srvTitle}
                    onChangeText={setSrvTitle}
                    placeholder="Service Name (e.g. 24K Gold Polishing)"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={srvDesc}
                    onChangeText={setSrvDesc}
                    placeholder="Service Description & Details"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <View style={styles.rowTwo}>
                    <TextInput
                      value={srvPrice}
                      onChangeText={setSrvPrice}
                      placeholder="Base Price (₹)"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                    <TextInput
                      value={srvDays}
                      onChangeText={setSrvDays}
                      placeholder="Days (e.g. 1-2 Days)"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={handleCreateServiceRate} style={[styles.addBtn, { flex: 1, backgroundColor: themeColors.accent }]}>
                      <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>
                        {editingServiceId ? 'UPDATE SERVICE RATE' : 'ADD SERVICE RATE'}
                      </Text>
                    </TouchableOpacity>
                    {editingServiceId ? (
                      <TouchableOpacity onPress={handleCancelServiceEdit} style={[styles.addBtn, { paddingHorizontal: 16, backgroundColor: themeColors.inputBg, borderWidth: 1, borderColor: themeColors.border }]}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.foreground }}>CANCEL</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Service Rates Catalog List */}
                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>SERVICE RATES CATALOG ({serviceCatalog.length})</Text>
                {serviceCatalog.length === 0 ? (
                  <Text style={{ color: themeColors.mutedForeground, fontSize: 12, marginBottom: 12 }}>
                    No services in catalog. Add your custom service rates above.
                  </Text>
                ) : (
                  serviceCatalog.map((sc) => (
                    <View key={sc.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, marginBottom: 8 }]}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[styles.codeTitle, { color: themeColors.foreground }]}>{sc.title}</Text>
                        <Text style={[styles.codeLabel, { color: themeColors.accent }]}>
                          Base Rate: ₹{sc.basePrice} • Time: {sc.estimatedDays || '1-2 Days'}
                        </Text>
                        {sc.description ? (
                          <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>{sc.description}</Text>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TouchableOpacity onPress={() => handleEditServiceCatalog(sc)} style={{ padding: 6 }}>
                          <Edit3 size={16} color={themeColors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteServiceCatalog(sc.id)} style={{ padding: 6 }}>
                          <Trash2 size={16} color={themeColors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                {/* Service Booking Requests List */}
                <Text style={[styles.sectionHeading, { color: themeColors.foreground, marginTop: 16 }]}>CUSTOMER SERVICE BOOKINGS ({services.length})</Text>
                {services.map((s) => (
                  <View key={s.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderNumText, { color: themeColors.accent }]}>{s.serviceNumber}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.orderStatusText, { color: themeColors.foreground }]}>{s.status}</Text>
                        <TouchableOpacity onPress={() => handleDeleteServiceBooking(s.id)} style={{ padding: 4 }}>
                          <Trash2 size={16} color={themeColors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={[styles.customerText, { color: themeColors.foreground }]}>Client: {s.userName} ({s.userPhone})</Text>
                    <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Item: {s.itemDescription}</Text>
                    <Text style={[styles.customerText, { color: themeColors.accent }]}>Notes: {s.trackingNotes}</Text>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => handleUpdateServiceTracking(s.id, 'In Polishing Workshop', 'Item in workshop for polishing')}
                        style={[styles.statusBtn, { backgroundColor: themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '800', color: themeColors.foreground }}>IN POLISHING</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateServiceTracking(s.id, 'Polishing Completed', 'Polishing finished with quality check')}
                        style={[styles.statusBtn, { backgroundColor: themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '800', color: themeColors.foreground }}>POLISHING DONE</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateServiceTracking(s.id, 'Delivered', 'Item delivered to client')}
                        style={[styles.statusBtn, { backgroundColor: themeColors.accent }]}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '800', color: themeColors.accentForeground }}>DELIVERED</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* STORE ENQUIRIES TAB */}
            {activeTab === 'enquiries' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>STORE ENQUIRIES ({enquiries.length})</Text>
                {enquiries.map((e) => (
                  <View key={e.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderNumText, { color: themeColors.accent }]}>{e.enquiryNumber}</Text>
                      <Text style={[styles.orderStatusText, { color: themeColors.foreground }]}>{e.status}</Text>
                    </View>
                    <Text style={[styles.customerText, { color: themeColors.foreground }]}>From: {e.name} ({e.email || e.phone})</Text>
                    <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Phone: {e.phone || 'N/A'} • Subject: {e.subject}</Text>
                    <Text style={[styles.customerText, { color: themeColors.foreground }]}>Msg: {e.message}</Text>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => handleUpdateEnquiryStatus(e.id, 'Responded')}
                        style={[styles.statusBtn, { backgroundColor: themeColors.accent }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: themeColors.accentForeground }}>MARK RESPONDED</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleUpdateEnquiryStatus(e.id, 'Closed')}
                        style={[styles.statusBtn, { backgroundColor: themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '800', color: themeColors.foreground }}>CLOSE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* PRODUCTS TAB WITH MULTIPLE DESIGN VARIANTS */}
            {activeTab === 'products' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>ADD PRODUCT WITH CATEGORY & DESIGNS</Text>
                  
                  <TextInput
                    value={pTitle}
                    onChangeText={setPTitle}
                    placeholder="Product Title"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />

                  {/* Category Selection Chips */}
                  <Text style={[styles.label, { color: themeColors.mutedForeground }]}>SELECT CATEGORY</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {['gold', 'bridal', 'chains', 'rings', 'earrings', 'bangles'].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setPCategory(cat)}
                        style={[styles.catSelChip, { backgroundColor: pCategory === cat ? themeColors.accent : themeColors.inputBg }]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: pCategory === cat ? themeColors.accentForeground : themeColors.foreground }}>
                          {cat.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.rowTwo}>
                    <TextInput
                      value={pPrice}
                      onChangeText={setPPrice}
                      placeholder="Sale Price (₹)"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                    <TextInput
                      value={pComparePrice}
                      onChangeText={setPComparePrice}
                      placeholder="Reg. Price (₹)"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                  </View>
                  {/* Product Main Image Upload Button */}
                  <TouchableOpacity
                    onPress={() => uploadImageFromDevice(url => setPImgUrl(url))}
                    disabled={uploadingImg}
                    style={{
                      backgroundColor: themeColors.inputBg,
                      borderWidth: 1,
                      borderColor: themeColors.accent,
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 6
                    }}
                  >
                    {uploadingImg ? (
                      <ActivityIndicator size="small" color={themeColors.accent} />
                    ) : (
                      <>
                        <Upload size={16} color={themeColors.accent} />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.accent }}>
                          {pImgUrl ? '✓ Main Image Uploaded (Tap to Change)' : '📷 UPLOAD PRODUCT PHOTO FROM DEVICE'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Multiple Design Variants Inputs */}
                  <View style={styles.designsBlock}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.label, { color: themeColors.accent }]}>MULTIPLE DESIGN VARIANTS ({pDesigns.length})</Text>
                      <TouchableOpacity onPress={addDesignField} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Plus size={14} color={themeColors.accent} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accent }}>Add Design</Text>
                      </TouchableOpacity>
                    </View>

                    {pDesigns.map((des, index) => (
                      <View key={index} style={[styles.designInputCard, { backgroundColor: themeColors.inputBg, gap: 8 }]}>
                        <TextInput
                          value={des.title}
                          onChangeText={(text) => {
                            const updated = [...pDesigns];
                            updated[index].title = text;
                            setPDesigns(updated);
                          }}
                          placeholder={`Design #${index + 1} Name (e.g. Peacock Royal)`}
                          placeholderTextColor={themeColors.mutedForeground}
                          style={[styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.foreground, height: 40 }]}
                        />

                        <TouchableOpacity
                          onPress={() =>
                            uploadImageFromDevice((url) => {
                              const updated = [...pDesigns];
                              updated[index].image = url;
                              setPDesigns(updated);
                            })
                          }
                          disabled={uploadingImg}
                          style={{
                            backgroundColor: themeColors.card,
                            borderWidth: 1,
                            borderColor: themeColors.border,
                            borderRadius: 6,
                            paddingVertical: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 6
                          }}
                        >
                          <CameraIcon size={14} color={themeColors.accent} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>
                            {des.image ? '✓ Design Photo Uploaded (Tap to Change)' : '📷 Pick Design Photo from Device'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* Bestseller Toggle Control */}
                  <View style={{ marginVertical: 8, gap: 6 }}>
                    <Text style={[styles.label, { color: themeColors.mutedForeground }]}>BESTSELLER BADGE STATUS</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setPBestSeller('No')}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: 'center',
                          backgroundColor: pBestSeller !== 'Yes' ? themeColors.accent : themeColors.card,
                          borderColor: themeColors.border,
                          borderWidth: 1
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: pBestSeller !== 'Yes' ? themeColors.accentForeground : themeColors.foreground }}>
                          Standard Product (Default: No)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setPBestSeller('Yes')}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: 'center',
                          backgroundColor: pBestSeller === 'Yes' ? '#EAB308' : themeColors.card,
                          borderColor: themeColors.border,
                          borderWidth: 1
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: pBestSeller === 'Yes' ? '#000000' : themeColors.foreground }}>
                          ⭐ Bestseller ON
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleCreateProduct}
                    style={[styles.addBtn, { backgroundColor: themeColors.accent }]}
                  >
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>SAVE PRODUCT & DESIGNS</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                  <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>PRODUCTS ({products.length})</Text>
                  {products.map((p) => (
                    <View key={p.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.codeTitle, { color: themeColors.foreground }]}>{p.title}</Text>
                        <Text style={[styles.codeLabel, { color: themeColors.accent }]}>
                          Cat: {p.category?.toUpperCase()} • ₹{p.price.toLocaleString('en-IN')} • {p.designs?.length || 0} Designs
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteProduct(p.id)} style={{ padding: 6 }}>
                        <Trash2 size={16} color={themeColors.destructive} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ACCESS CODES TAB */}
            {activeTab === 'codes' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>ADD NEW ACCESS ID</Text>
                  <TextInput
                    value={newCode}
                    onChangeText={setNewCode}
                    placeholder="Access Code String (e.g. VIP2026)"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={newCodeLabel}
                    onChangeText={setNewCodeLabel}
                    placeholder="Client / Partner Label"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TouchableOpacity
                    onPress={handleCreateCode}
                    style={[styles.addBtn, { backgroundColor: themeColors.accent }]}
                  >
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>CREATE ACCESS ID</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                  <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>ACTIVE ACCESS CODES</Text>
                  {accessCodes.map((item) => (
                    <View key={item.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.codeTitle, { color: themeColors.accent }]}>{item.code}</Text>
                        <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>{item.label} • Used: {item.usageCount} times</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleToggleCode(item.id, item.isActive)} style={{ padding: 6 }}>
                        <Text style={{ color: item.isActive ? themeColors.success : themeColors.destructive, fontWeight: '800', fontSize: 12 }}>
                          {item.isActive ? 'ACTIVE' : 'DISABLED'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCode(item.id)} style={{ padding: 6 }}>
                        <Trash2 size={16} color={themeColors.destructive} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* PARTIES & LEDGER TAB */}
            {activeTab === 'parties' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>ADD NEW PARTY / WHOLESALE ACCOUNT</Text>
                  <TextInput
                    value={partyName}
                    onChangeText={setPartyName}
                    placeholder="Party / Shop Name"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={partyPhone}
                    onChangeText={setPartyPhone}
                    placeholder="Contact Phone Number"
                    keyboardType="phone-pad"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={partyEmail}
                    onChangeText={setPartyEmail}
                    placeholder="Customer Registered Email (e.g. customer@gmail.com)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={partyCity}
                    onChangeText={setPartyCity}
                    placeholder="City / Market Location"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={partyOpeningBal}
                    onChangeText={setPartyOpeningBal}
                    placeholder="Opening Balance (₹)"
                    keyboardType="numeric"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TouchableOpacity onPress={handleCreateParty} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}>
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>CREATE PARTY ACCOUNT</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>PARTY ACCOUNTS ({parties.length})</Text>
                {parties.length === 0 ? (
                  <Text style={{ color: themeColors.mutedForeground, fontSize: 12 }}>No party accounts found.</Text>
                ) : (
                  parties.map((p) => (
                    <View key={p.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={styles.orderHeader}>
                        <Text style={[styles.orderNumText, { color: themeColors.accent }]}>{p.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.orderStatusText, { color: p.currentBalance > 0 ? '#EF4444' : '#10B981' }]}>
                            Due: ₹{p.currentBalance?.toLocaleString('en-IN') || 0}
                          </Text>
                          <TouchableOpacity onPress={() => handleDeleteParty(p.id)} style={{ padding: 4 }}>
                            <Trash2 size={16} color={themeColors.destructive} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.customerText, { color: themeColors.foreground }]}>Phone: {p.phone} • Email: {p.email || 'Not Linked'}</Text>
                      <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>City: {p.city || 'Local'}</Text>
                      <Text style={[styles.amountText, { color: themeColors.mutedForeground }]}>Total Billed: ₹{p.totalBilled || 0} • Total Paid: ₹{p.totalPaid || 0}</Text>

                      {/* Quick Record Payment inline for Admin */}
                      {selectedPartyId === p.id ? (
                        <View style={{ gap: 8, marginTop: 8, padding: 8, backgroundColor: themeColors.inputBg, borderRadius: 8 }}>
                          <TextInput
                            value={partyPayAmount}
                            onChangeText={setPartyPayAmount}
                            placeholder="Payment Received Amount (₹)"
                            keyboardType="numeric"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <TextInput
                            value={partyPayNotes}
                            onChangeText={setPartyPayNotes}
                            placeholder="Payment Notes / UTR"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity onPress={() => handleRecordPartyPayment(p.id)} style={{ flex: 1, backgroundColor: themeColors.accent, padding: 8, borderRadius: 6, alignItems: 'center' }}>
                              <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accentForeground }}>RECORD</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedPartyId('')} style={{ flex: 1, backgroundColor: themeColors.card, padding: 8, borderRadius: 6, alignItems: 'center' }}>
                              <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>CANCEL</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => setSelectedPartyId(p.id)} style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accent }}>+ RECORD PAYMENT / CREDIT</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* CATEGORIES TAB (Photo 1 & Photo 2) */}
            {activeTab === 'categories' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>CREATE CATEGORY WITH PHOTO 1 & PHOTO 2</Text>
                  <TextInput
                    value={catNameText}
                    onChangeText={setCatNameText}
                    placeholder="Category Name (e.g. Kundan Sets)"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />

                  {/* Photo 1 Upload */}
                  <TouchableOpacity
                    onPress={() => uploadImageFromDevice(url => setCatPhoto1(url))}
                    disabled={uploadingImg}
                    style={{ backgroundColor: themeColors.inputBg, borderWidth: 1, borderColor: themeColors.border, borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                  >
                    <Upload size={14} color={themeColors.accent} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>
                      {catPhoto1 ? '✓ Main Category Photo Uploaded' : '📁 Pick Photo 1 from Device'}
                    </Text>
                  </TouchableOpacity>

                  {/* Photo 2 Upload */}
                  <TouchableOpacity
                    onPress={() => uploadImageFromDevice(url => setCatPhoto2(url))}
                    disabled={uploadingImg}
                    style={{ backgroundColor: themeColors.inputBg, borderWidth: 1, borderColor: themeColors.border, borderRadius: 8, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
                  >
                    <Upload size={14} color={themeColors.accent} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>
                      {catPhoto2 ? '✓ Photo 2 Uploaded' : '📁 Pick Photo 2 from Device'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleCreateCategory} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}>
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>SAVE CATEGORY</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>STORE CATEGORIES ({categories.length})</Text>
                {categories.map((cat) => (
                  <View key={cat.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={{ gap: 2, flex: 1 }}>
                      <Text style={[styles.codeTitle, { color: themeColors.foreground }]}>{cat.name}</Text>
                      <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>Slug: {cat.slug}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {cat.image ? (
                        <Image source={{ uri: cat.image }} style={{ width: 40, height: 40, borderRadius: 6, borderWidth: 1, borderColor: themeColors.border }} />
                      ) : null}
                      <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)} style={{ padding: 4 }}>
                        <Trash2 size={16} color={themeColors.destructive} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SERVICES TRACKING & SERVICE RATES CATALOG TAB */}
            {activeTab === 'services' && (
              <View style={styles.tabContent}>
                {/* Add Service Rate Form */}
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>
                    {editingServiceId ? 'EDIT SERVICE RATE IN CATALOG' : 'ADD SERVICE RATE TO CATALOG'}
                  </Text>
                  <TextInput
                    value={srvTitle}
                    onChangeText={setSrvTitle}
                    placeholder="Service Name (e.g. Gold Polishing)"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={srvDesc}
                    onChangeText={setSrvDesc}
                    placeholder="Service Description & Details"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <View style={styles.rowTwo}>
                    <TextInput
                      value={srvPrice}
                      onChangeText={setSrvPrice}
                      placeholder="Base Price (₹)"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                    <TextInput
                      value={srvDays}
                      onChangeText={setSrvDays}
                      placeholder="Days (e.g. 1-2 Days)"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={handleCreateServiceRate} style={[styles.addBtn, { flex: 1, backgroundColor: themeColors.accent }]}>
                      <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>
                        {editingServiceId ? 'UPDATE SERVICE RATE' : 'ADD SERVICE RATE'}
                      </Text>
                    </TouchableOpacity>
                    {editingServiceId ? (
                      <TouchableOpacity onPress={handleCancelServiceEdit} style={[styles.addBtn, { paddingHorizontal: 16, backgroundColor: themeColors.inputBg, borderWidth: 1, borderColor: themeColors.border }]}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.foreground }}>CANCEL</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Service Rates Catalog List */}
                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>SERVICE RATES CATALOG ({serviceCatalog.length})</Text>
                {serviceCatalog.length === 0 ? (
                  <Text style={{ color: themeColors.mutedForeground, fontSize: 12, marginBottom: 12 }}>
                    No services in catalog. Add your custom service rates above.
                  </Text>
                ) : (
                  serviceCatalog.map((sc) => (
                    <View key={sc.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border, marginBottom: 8 }]}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[styles.codeTitle, { color: themeColors.foreground }]}>{sc.title}</Text>
                        <Text style={[styles.codeLabel, { color: themeColors.accent }]}>
                          Base Rate: ₹{sc.basePrice} • Time: {sc.estimatedDays || '1-2 Days'}
                        </Text>
                        {sc.description ? (
                          <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>{sc.description}</Text>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <TouchableOpacity onPress={() => handleEditServiceCatalog(sc)} style={{ padding: 6 }}>
                          <Edit3 size={16} color={themeColors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteServiceCatalog(sc.id)} style={{ padding: 6 }}>
                          <Trash2 size={16} color={themeColors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                {/* Service Booking Requests List */}
                <Text style={[styles.sectionHeading, { color: themeColors.foreground, marginTop: 12 }]}>CUSTOMER SERVICE BOOKINGS ({services.length})</Text>
                {services.map((srv) => (
                  <View key={srv.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderNumText, { color: themeColors.accent }]}>{srv.serviceType?.toUpperCase() || 'SERVICE REQUEST'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.orderStatusText, { color: themeColors.foreground }]}>{srv.status}</Text>
                        <TouchableOpacity onPress={() => handleDeleteServiceBooking(srv.id)} style={{ padding: 4 }}>
                          <Trash2 size={16} color={themeColors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={[styles.customerText, { color: themeColors.foreground }]}>Customer: {srv.userName} ({srv.phone})</Text>
                    <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Item: {srv.itemDescription || 'Jewelry item'}</Text>
                    {srv.photo ? (
                      <Image source={{ uri: srv.photo }} style={{ width: '100%', height: 120, borderRadius: 8, marginVertical: 6 }} resizeMode="cover" />
                    ) : null}

                    <View style={styles.actionRow}>
                      {['In Progress', 'Completed', 'Delivered'].map((st) => (
                        <TouchableOpacity
                          key={st}
                          onPress={() => handleUpdateServiceTracking(srv.id, st, `Status updated to ${st}`)}
                          style={[styles.statusBtn, { backgroundColor: srv.status === st ? themeColors.accent : themeColors.inputBg }]}
                        >
                          <Text style={{ fontSize: 9, fontWeight: '800', color: srv.status === st ? themeColors.accentForeground : themeColors.foreground }}>
                            {st.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* PRODUCT RETURNS TAB */}
            {activeTab === 'returns' && (
              <View style={styles.tabContent}>
                {/* Log Return Request Form */}
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>LOG NEW PRODUCT RETURN REQUEST</Text>
                  <TextInput
                    value={retCustName}
                    onChangeText={setRetCustName}
                    placeholder="Customer Name"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={retCustPhone}
                    onChangeText={setRetCustPhone}
                    placeholder="Customer Phone"
                    keyboardType="phone-pad"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={retProdTitle}
                    onChangeText={setRetProdTitle}
                    placeholder="Product Item Title"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <View style={styles.rowTwo}>
                    <TextInput
                      value={retQty}
                      onChangeText={setRetQty}
                      placeholder="Qty"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                    <TextInput
                      value={retRefundAmt}
                      onChangeText={setRetRefundAmt}
                      placeholder="Refund Amt (₹)"
                      keyboardType="numeric"
                      placeholderTextColor={themeColors.mutedForeground}
                      style={[styles.halfInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                    />
                  </View>
                  <TextInput
                    value={retReason}
                    onChangeText={setRetReason}
                    placeholder="Return Reason"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TouchableOpacity onPress={handleCreateReturn} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}>
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>SUBMIT RETURN</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>PRODUCT RETURNS ({returnsList.length})</Text>
                {returnsList.length === 0 ? (
                  <Text style={{ color: themeColors.mutedForeground, fontSize: 12 }}>No return requests logged.</Text>
                ) : (
                  returnsList.map((ret) => (
                    <View key={ret.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={styles.orderHeader}>
                        <Text style={[styles.orderNumText, { color: themeColors.accent }]}>Return #{ret.id.slice(-6)}</Text>
                        <Text style={[styles.orderStatusText, { color: themeColors.foreground }]}>{ret.status || 'Pending'}</Text>
                      </View>
                      <Text style={[styles.customerText, { color: themeColors.foreground }]}>Customer: {ret.customerName} ({ret.customerPhone})</Text>
                      <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Product: {ret.productTitle} • Qty: {ret.quantity || 1}</Text>
                      <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Reason: {ret.reason || 'Not specified'}</Text>
                      <Text style={[styles.amountText, { color: themeColors.accent }]}>Refund Amount: ₹{ret.refundAmount || 0}</Text>

                      <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => handleUpdateReturnStatus(ret.id, 'Approved', true)} style={[styles.statusBtn, { backgroundColor: '#10B981' }]}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFF' }}>APPROVE & RESTOCK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateReturnStatus(ret.id, 'Refunded', false)} style={[styles.statusBtn, { backgroundColor: themeColors.accent }]}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: themeColors.accentForeground }}>REFUNDED</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateReturnStatus(ret.id, 'Rejected', false)} style={[styles.statusBtn, { backgroundColor: '#EF4444' }]}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFF' }}>REJECT</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* COUPONS TAB */}
            {activeTab === 'coupons' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>CREATE DISCOUNT COUPON</Text>
                  <TextInput
                    value={couponCodeText}
                    onChangeText={setCouponCodeText}
                    placeholder="Coupon Code (e.g. GOLD20)"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={couponPercentText}
                    onChangeText={setCouponPercentText}
                    placeholder="Discount Percentage (%)"
                    keyboardType="numeric"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TouchableOpacity onPress={handleCreateCoupon} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}>
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>CREATE COUPON</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>DISCOUNT COUPONS ({coupons.length})</Text>
                {coupons.length === 0 ? (
                  <Text style={{ color: themeColors.mutedForeground, fontSize: 12 }}>No active discount coupons.</Text>
                ) : (
                  coupons.map((c) => (
                    <View key={c.id || c.code} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.codeTitle, { color: themeColors.accent }]}>{c.code}</Text>
                        <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>{c.discountPercent}% OFF Discount</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: c.isActive ? '#10B981' : '#EF4444' }}>
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                        <TouchableOpacity onPress={() => handleDeleteCoupon(c.id)} style={{ padding: 4 }}>
                          <Trash2 size={16} color={themeColors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>UPLOAD HERO BANNER / OFFER POSTER</Text>
                  <TextInput
                    value={bTitle}
                    onChangeText={setBTitle}
                    placeholder="Banner Headline Title"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />
                  <TextInput
                    value={bSubtitle}
                    onChangeText={setBSubtitle}
                    placeholder="Subtitle / Offer Subheading"
                    placeholderTextColor={themeColors.mutedForeground}
                    style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
                  />

                  {/* Banner Image Upload Button */}
                  <TouchableOpacity
                    onPress={() => uploadImageFromDevice(url => setBImgUrl(url))}
                    disabled={uploadingImg}
                    style={{
                      backgroundColor: themeColors.inputBg,
                      borderWidth: 1,
                      borderColor: themeColors.accent,
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 6
                    }}
                  >
                    {uploadingImg ? (
                      <ActivityIndicator size="small" color={themeColors.accent} />
                    ) : (
                      <>
                        <Upload size={16} color={themeColors.accent} />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.accent }}>
                          {bImgUrl ? '✓ Banner Photo Uploaded (Tap to Change)' : '📷 UPLOAD BANNER PHOTO FROM DEVICE'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setBIsHero(!bIsHero)}
                    style={[styles.typeToggle, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}
                  >
                    <Text style={[styles.typeToggleText, { color: themeColors.foreground }]}>
                      Type: <Text style={{ color: themeColors.accent, fontWeight: '800' }}>{bIsHero ? 'Top Hero Banner' : 'Offer Poster'}</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCreateBanner}
                    style={[styles.addBtn, { backgroundColor: themeColors.accent }]}
                  >
                    <Text style={[styles.addBtnText, { color: themeColors.accentForeground }]}>PUBLISH BANNER</Text>
                  </TouchableOpacity>
                </View>

                {/* Published Banners List */}
                <Text style={[styles.sectionHeading, { color: themeColors.foreground, marginTop: 12 }]}>PUBLISHED BANNERS ({banners.length})</Text>
                {banners.map((b) => (
                  <View key={b.id} style={[styles.itemRowCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Image source={{ uri: b.image }} style={{ width: 50, height: 40, borderRadius: 6 }} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.codeTitle, { color: themeColors.foreground }]}>{b.title}</Text>
                      <Text style={[styles.codeLabel, { color: themeColors.mutedForeground }]}>{b.badgeText || (b.isHero ? 'HERO' : 'POSTER')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteBanner(b.id)} style={{ padding: 4 }}>
                      <Trash2 size={16} color={themeColors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* ORDERS TAB WITH ADVANCED TRACKING */}
            {activeTab === 'orders' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>CUSTOMER ORDERS & TRACKING ({orders.length})</Text>
                {orders.map((o) => {
                  const isEditingTracking = selectedTrackingOrderId === o.id;
                  return (
                    <View key={o.id} style={[styles.orderAdminCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <View style={styles.orderHeader}>
                        <Text style={[styles.orderNumText, { color: themeColors.accent }]}>#{o.orderNumber}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.orderStatusText, { color: o.status === 'Delivered' ? '#10B981' : themeColors.accent }]}>{o.status}</Text>
                          <Text style={{ fontSize: 10, color: o.paymentStatus === 'Paid' ? '#10B981' : '#EF4444', fontWeight: '800' }}>({o.paymentStatus})</Text>
                        </View>
                      </View>

                      <Text style={[styles.customerText, { color: themeColors.foreground }]}>Customer: {o.userName} ({o.userPhone})</Text>
                      {o.userEmail ? <Text style={[styles.customerText, { color: themeColors.mutedForeground }]}>Email: {o.userEmail}</Text> : null}
                      <Text style={[styles.amountText, { color: themeColors.accent }]}>Total: ₹{o.totalAmount?.toLocaleString('en-IN')} • Mode: {o.paymentMethod?.toUpperCase()}</Text>

                      {o.trackingNumber || o.courierPartner ? (
                        <View style={{ marginVertical: 4, padding: 6, backgroundColor: themeColors.inputBg, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: themeColors.accent }}>
                            🚚 {o.courierPartner || 'Courier'}: AWB #{o.trackingNumber || 'N/A'}
                          </Text>
                          {o.estimatedDelivery ? <Text style={{ fontSize: 9, color: themeColors.mutedForeground }}>Est Delivery: {o.estimatedDelivery}</Text> : null}
                        </View>
                      ) : null}

                      {/* ADVANCED TRACKING DISPATCH EDIT PANEL */}
                      {isEditingTracking ? (
                        <View style={{ gap: 8, marginTop: 8, padding: 10, backgroundColor: themeColors.inputBg, borderRadius: 8, borderWidth: 1, borderColor: themeColors.accent }}>
                          <Text style={{ fontSize: 11, fontWeight: '900', color: themeColors.accent }}>
                            🚚 ADVANCED SHIPMENT & COURIER TRACKING
                          </Text>

                          <TextInput
                            value={ordCourierPartner}
                            onChangeText={setOrdCourierPartner}
                            placeholder="Courier Partner (e.g. Delhivery / BlueDart / DTDC)"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <TextInput
                            value={ordTrackingNumber}
                            onChangeText={setOrdTrackingNumber}
                            placeholder="AWB Tracking Number (e.g. AWB987654321)"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <TextInput
                            value={ordTrackingUrl}
                            onChangeText={setOrdTrackingUrl}
                            placeholder="Live Courier Tracking URL (Optional)"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <TextInput
                            value={ordEstimatedDelivery}
                            onChangeText={setOrdEstimatedDelivery}
                            placeholder="Estimated Delivery (e.g. July 26, 2026)"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />
                          <TextInput
                            value={ordTrackingNotes}
                            onChangeText={setOrdTrackingNotes}
                            placeholder="Status Note for Customer (e.g. Dispatched from Mumbai)"
                            placeholderTextColor={themeColors.mutedForeground}
                            style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.foreground }]}
                          />

                          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                            {['Pending', 'Processing', 'In Polishing', 'Shipped', 'Out for Delivery', 'Delivered'].map((st) => (
                              <TouchableOpacity
                                key={st}
                                onPress={() => setOrdStatus(st)}
                                style={[styles.statusBtn, { backgroundColor: ordStatus === st ? themeColors.accent : themeColors.background }]}
                              >
                                <Text style={{ fontSize: 9, fontWeight: '800', color: ordStatus === st ? themeColors.accentForeground : themeColors.foreground }}>
                                  {st.toUpperCase()}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                            <TouchableOpacity onPress={handleSaveOrderTracking} style={{ flex: 1, backgroundColor: themeColors.accent, padding: 10, borderRadius: 6, alignItems: 'center' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: themeColors.accentForeground }}>SAVE & NOTIFY CUSTOMER</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedTrackingOrderId(null)} style={{ paddingHorizontal: 14, backgroundColor: themeColors.card, padding: 10, borderRadius: 6, alignItems: 'center' }}>
                              <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.foreground }}>CANCEL</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                          <TouchableOpacity
                            onPress={() => handleOpenOrderTracking(o)}
                            style={[styles.statusBtn, { flex: 1, backgroundColor: themeColors.accent, alignItems: 'center' }]}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '800', color: themeColors.accentForeground }}>🚚 UPDATE TRACKING & SHIPMENT</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && settings && (
              <View style={styles.tabContent}>
                <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Text style={[styles.formTitle, { color: themeColors.foreground }]}>PAYMENT METHOD TOGGLES</Text>

                  <TouchableOpacity
                    onPress={() => handleTogglePaymentMethod('cod')}
                    style={[styles.settingToggleRow, { borderColor: themeColors.border }]}
                  >
                    <Text style={[styles.settingLabel, { color: themeColors.foreground }]}>Cash on Delivery (COD)</Text>
                    <Text style={{ fontWeight: '800', color: settings.paymentMethods.cod.enabled ? themeColors.success : themeColors.destructive }}>
                      {settings.paymentMethods.cod.enabled ? 'ENABLED' : 'DISABLED'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleTogglePaymentMethod('qrCode')}
                    style={[styles.settingToggleRow, { borderColor: themeColors.border }]}
                  >
                    <Text style={[styles.settingLabel, { color: themeColors.foreground }]}>QR Code UPI Payment</Text>
                    <Text style={{ fontWeight: '800', color: settings.paymentMethods.qrCode.enabled ? themeColors.success : themeColors.destructive }}>
                      {settings.paymentMethods.qrCode.enabled ? 'ENABLED' : 'DISABLED'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleTogglePaymentMethod('payLater')}
                    style={[styles.settingToggleRow, { borderColor: themeColors.border }]}
                  >
                    <Text style={[styles.settingLabel, { color: themeColors.foreground }]}>Pay Later Option</Text>
                    <Text style={{ fontWeight: '800', color: settings.paymentMethods.payLater.enabled ? themeColors.success : themeColors.destructive }}>
                      {settings.paymentMethods.payLater.enabled ? 'ENABLED' : 'DISABLED'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      {/* PRINTABLE TAX INVOICE RECEIPT MODAL */}
      {printableInvoice && (
        <Modal animationType="slide" transparent visible={!!printableInvoice}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{ width: '100%', maxWidth: 450, backgroundColor: '#FFF', borderRadius: 12, padding: 20, gap: 12 }}>
              <View style={{ alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 1 }}>ARIHANT GOLD</Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#666' }}>24K FORMING JEWELLERY BOUTIQUE</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 4, color: '#000' }}>Tax Invoice / POS Sale Receipt</Text>
                <Text style={{ fontSize: 11, color: '#444' }}>Invoice #: {printableInvoice.orderNumber} | {new Date(printableInvoice.createdAt || Date.now()).toLocaleDateString()}</Text>
              </View>

              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 12, color: '#000' }}><Text style={{ fontWeight: '800' }}>Customer:</Text> {printableInvoice.userName}</Text>
                <Text style={{ fontSize: 12, color: '#000' }}><Text style={{ fontWeight: '800' }}>Phone:</Text> {printableInvoice.userPhone}</Text>
                <Text style={{ fontSize: 12, color: '#000' }}><Text style={{ fontWeight: '800' }}>Payment Status:</Text> {printableInvoice.paymentStatus || 'PAID'}</Text>
              </View>

              <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#000', paddingVertical: 8, gap: 6 }}>
                {printableInvoice.items?.map((item: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: '#000', fontWeight: '600' }}>{item.title} x{item.quantity}</Text>
                    <Text style={{ fontSize: 12, color: '#000', fontWeight: '800' }}>₹{item.price?.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: 16, fontWeight: '900', color: '#000', textAlign: 'right' }}>
                Total Amount: ₹{printableInvoice.totalAmount?.toLocaleString('en-IN')}
              </Text>

              <TouchableOpacity onPress={() => setPrintableInvoice(null)} style={{ backgroundColor: '#000', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>CLOSE RECEIPT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* PRINTABLE PARTY STATEMENT MODAL */}
      {printableStatement && (
        <Modal animationType="slide" transparent visible={!!printableStatement}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <View style={{ width: '100%', maxWidth: 450, backgroundColor: '#FFF', borderRadius: 12, padding: 20, gap: 12 }}>
              <View style={{ alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 1 }}>ARIHANT GOLD & LUXURY</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#444' }}>PARTY ACCOUNT LEDGER STATEMENT</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', marginTop: 4, color: '#000' }}>Party: {printableStatement.party?.name} ({printableStatement.party?.phone})</Text>
              </View>

              <ScrollView style={{ maxHeight: 250 }}>
                {printableStatement.transactions?.map((t: any, idx: number) => (
                  <View key={idx} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#000' }}>{t.description}</Text>
                      <Text style={{ fontSize: 10, color: '#666' }}>{new Date(t.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: t.debit > 0 ? '#EF4444' : '#10B981' }}>
                      {t.debit > 0 ? `₹${t.debit}` : `+₹${t.credit}`}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <Text style={{ fontSize: 15, fontWeight: '900', color: printableStatement.party?.currentBalance > 0 ? '#EF4444' : '#10B981', textAlign: 'right' }}>
                Current Due: ₹{printableStatement.party?.currentBalance?.toLocaleString('en-IN')}
              </Text>

              <TouchableOpacity onPress={() => setPrintableStatement(null)} style={{ backgroundColor: '#000', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>CLOSE STATEMENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  authLockInner: {
    flex: 1 },
  authLockScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24 },
  authLockCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center' },
  lockIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16 },
  authLockTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6 },
  authLockSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24 },
  formGap: {
    width: '100%',
    gap: 14 },
  fieldBlock: {
    gap: 4 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1 },
  inputRow: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10 },
  inputFlex: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' },
  authErrText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center' },
  authSubmitBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8 },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  authSubmitText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  tabsContainer: {
    paddingVertical: 10 },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1 },
  tabText: {
    fontSize: 12,
    fontWeight: '800' },
  scroll: {
    padding: 16,
    paddingBottom: 40 },
  tabContent: {
    gap: 16 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12 },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6 },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700' },
  metricVal: {
    fontSize: 20,
    fontWeight: '900' },
  formCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10 },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13 },
  rowTwo: {
    flexDirection: 'row',
    gap: 10 },
  halfInput: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13 },
  posProdChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1 },
  catSelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6 },
  designsBlock: {
    gap: 8,
    marginTop: 4 },
  designInputCard: {
    padding: 10,
    borderRadius: 8,
    gap: 6 },
  typeToggle: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1 },
  typeToggleText: {
    fontSize: 12 },
  addBtn: {
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4 },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1 },
  listSection: {
    gap: 10,
    marginTop: 8 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  itemRowCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between' },
  codeTitle: {
    fontSize: 14,
    fontWeight: '800' },
  codeLabel: {
    fontSize: 11,
    marginTop: 2 },
  orderAdminCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between' },
  orderNumText: {
    fontSize: 14,
    fontWeight: '800' },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '700' },
  customerText: {
    fontSize: 12 },
  amountText: {
    fontSize: 13,
    fontWeight: '800' },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap' },
  statusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6 },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1 },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700' } });

export default AdminPortalScreen;
