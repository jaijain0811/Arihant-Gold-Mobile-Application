import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { authService } from '../services/authService';
import { User, Package, Shield, LogOut, Moon, Sun, ChevronRight, HelpCircle, Wrench, Info, Receipt, Globe, RotateCcw, Trash2 } from 'lucide-react-native';

export const ProfileScreen = ({ navigation }: any) => {
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage, t } = useLanguageStore();
  const themeColors = colors[theme];

  const { user, logout } = useAuthStore();

  const isMasterAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'arihantgold20@gmail.com' || user?.email?.toLowerCase() === 'jaijain1466@gmail.com';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title={t('my_profile')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={[styles.userCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.avatar, { backgroundColor: themeColors.accent }]}>
            <User size={32} color={themeColors.accentForeground} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: themeColors.foreground }]}>
              {user ? user.name : 'VIP Member'}
            </Text>
            <Text style={[styles.userSub, { color: themeColors.mutedForeground }]}>
              {user ? user.email || user.phone : 'Member Account'}
            </Text>
            {isMasterAdmin && (
              <View style={[styles.badgeTag, { backgroundColor: themeColors.accent }]}>
                <Shield size={12} color={themeColors.accentForeground} />
                <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>
                  MASTER ADMIN
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {/* Master Admin Portal - VISIBLE IF LOGGED IN WITH ADMIN CREDENTIALS */}
          {isMasterAdmin && (
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => navigation.navigate('AdminPortal')}
            >
              <Shield size={20} color={themeColors.accent} />
              <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('admin_portal')}</Text>
              <ChevronRight size={18} color={themeColors.mutedForeground} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('CustomerLedger')}
          >
            <Receipt size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('account_ledger')}</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <Package size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('my_orders')}</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('ServiceBooking')}
          >
            <Wrench size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('services')}</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('ReturnRequest')}
          >
            <RotateCcw size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>Product Returns & Refunds</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('Help')}
          >
            <HelpCircle size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('help_support')}</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('AboutUs')}
          >
            <Info size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('about_us')}</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} color={themeColors.accent} /> : <Moon size={20} color={themeColors.foreground} />}
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>
              {t('app_theme')} ({theme === 'dark' ? 'Luxury Dark' : 'Warm Light'})
            </Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => {
              const nextLang = language === 'en' ? 'hi' : language === 'hi' ? 'mr' : 'en';
              setLanguage(nextLang);
            }}
          >
            <Globe size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>
              {t('change_language')} ({language === 'en' ? 'English' : language === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'})
            </Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Shield size={20} color={themeColors.accent} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>Privacy Policy & Data Safety</Text>
            <ChevronRight size={18} color={themeColors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to permanently delete your account and associated data? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await authService.deleteAccount();
                        await logout();
                        Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                      } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to delete account.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Trash2 size={20} color={themeColors.destructive} />
            <Text style={[styles.menuText, { color: themeColors.destructive }]}>Delete My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={themeColors.mutedForeground} />
            <Text style={[styles.menuText, { color: themeColors.foreground }]}>{t('logout')}</Text>
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
    padding: 16,
    gap: 16 },
  userCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center' },
  userInfo: {
    flex: 1 },
  userName: {
    fontSize: 16,
    fontWeight: '800' },
  userSub: {
    fontSize: 12,
    marginTop: 2 },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6 },
  badgeText: {
    fontSize: 10,
    fontWeight: '800' },
  menuSection: {
    gap: 10 },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700' } });
