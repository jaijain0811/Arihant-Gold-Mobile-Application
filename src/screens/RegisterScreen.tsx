import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { colors } from '../theme';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react-native';

export const RegisterScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = colors[theme];
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      setErrorMsg('Name, Phone Number, and Password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const result = await authService.register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password });

      if (result.success && result.token) {
        await setAuth(result.user, result.token);
      } else {
        setErrorMsg(result.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.foreground }]}>{t('register_title')}</Text>
            <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
              Join Arihant Gold & Luxury to manage your orders & exclusive member perks.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('full_name')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <User size={18} color={themeColors.accent} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('full_name')}
                  placeholderTextColor={themeColors.mutedForeground}
                  style={[styles.input, { color: themeColors.foreground }]}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('phone_number')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <Phone size={18} color={themeColors.accent} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('phone_number')}
                  placeholderTextColor={themeColors.mutedForeground}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: themeColors.foreground }]}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('email_address')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <Mail size={18} color={themeColors.accent} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('email_address')}
                  placeholderTextColor={themeColors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: themeColors.foreground }]}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('password')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <Lock size={18} color={themeColors.accent} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('password')}
                  placeholderTextColor={themeColors.mutedForeground}
                  secureTextEntry
                  style={[styles.input, { color: themeColors.foreground }]}
                />
              </View>
            </View>

            {errorMsg ? <Text style={[styles.errorText, { color: themeColors.destructive }]}>{errorMsg}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleRegister}
              style={[styles.regBtn, { backgroundColor: themeColors.accent }]}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.accentForeground} />
              ) : (
                <View style={styles.btnRow}>
                  <UserPlus size={18} color={themeColors.accentForeground} />
                  <Text style={[styles.regBtnText, { color: themeColors.accentForeground }]}>{t('register_btn')}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation?.navigate('Login')} style={styles.loginLink}>
              <Text style={[styles.loginText, { color: themeColors.mutedForeground }]}>
                {t('already_have_account')} <Text style={{ color: themeColors.accent, fontWeight: '800' }}>{t('login_btn')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  inner: {
    flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 32 },
  header: {
    marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    lineHeight: 18 },
  form: {
    gap: 16 },
  fieldGroup: {
    gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1 },
  inputWrapper: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12 },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' },
  errorText: {
    fontSize: 12,
    fontWeight: '600' },
  regBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8 },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  regBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1 },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12 },
  loginText: {
    fontSize: 13 } });
