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
import api from '../services/api';
import { Lock, PhoneCall, LogIn, ShieldCheck, Globe } from 'lucide-react-native';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ENV } from '../config/env';

export const LoginScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = colors[theme];
  const setAuth = useAuthStore((s) => s.setAuth);

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (ENV.GOOGLE_WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  const handleLogin = async () => {
    if (!identity.trim() || !password) {
      setErrorMsg('Please enter your Email/Phone and Password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const result = await authService.login(identity.trim(), password);

      if (result.success && result.token) {
        await setAuth(result.user, result.token);
      } else {
        setErrorMsg(result.message || 'Invalid login credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login Action
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMsg('');

      if (!ENV.GOOGLE_WEB_CLIENT_ID) {
        setErrorMsg('Set GOOGLE_WEB_CLIENT_ID in mobile/.env to activate Google OAuth.');
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const userObj = (response as any)?.data?.user || (response as any)?.user;
      const idToken = (response as any)?.data?.idToken || (response as any)?.idToken;

      if (!userObj?.email) {
        setErrorMsg('Google Sign-In failed to retrieve user profile.');
        return;
      }

      const res = await api.post('/auth/google', {
        email: userObj.email,
        name: userObj.name || 'Google Member',
        idToken
      });

      if (res.data?.success && res.data.token) {
        await setAuth(res.data.user, res.data.token);
      } else {
        setErrorMsg(res.data?.message || 'Google OAuth failed.');
      }
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMsg('Google Sign-In was cancelled.');
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setErrorMsg('Google Sign-In is already in progress.');
      } else {
        setErrorMsg(e.response?.data?.message || e.message || 'Google OAuth Sign In failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={[styles.badgeContainer, { backgroundColor: themeColors.border }]}>
              <ShieldCheck size={14} color={themeColors.accent} />
              <Text style={[styles.badgeText, { color: themeColors.accent }]}>{t('vip_access')}</Text>
            </View>
            <Text style={[styles.title, { color: themeColors.foreground }]}>{t('login_title')}</Text>
            <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
              {t('login_sub')}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Identity Input */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('email_or_phone')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <PhoneCall size={18} color={themeColors.accent} />
                <TextInput
                  value={identity}
                  onChangeText={(text) => {
                    setIdentity(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter Email Address or Phone"
                  placeholderTextColor={themeColors.mutedForeground}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { color: themeColors.foreground }]}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.mutedForeground }]}>{t('password')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                <Lock size={18} color={themeColors.accent} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter Your Password"
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
              onPress={handleLogin}
              style={[styles.loginBtn, { backgroundColor: themeColors.accent }]}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.accentForeground} />
              ) : (
                <View style={styles.btnRow}>
                  <LogIn size={18} color={themeColors.accentForeground} />
                  <Text style={[styles.loginBtnText, { color: themeColors.accentForeground }]}>{t('login_btn')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Google OAuth Login Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={googleLoading}
              onPress={handleGoogleLogin}
              style={[styles.googleBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            >
              {googleLoading ? (
                <ActivityIndicator color={themeColors.accent} />
              ) : (
                <View style={styles.btnRow}>
                  <Globe size={18} color={themeColors.accent} />
                  <Text style={[styles.googleBtnText, { color: themeColors.foreground }]}>{t('google_login')}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation?.navigate('Register')}
              style={styles.registerLink}
            >
              <Text style={[styles.registerText, { color: themeColors.mutedForeground }]}>
                {t('dont_have_account')} <Text style={{ color: themeColors.accent, fontWeight: '800' }}>{t('create_account')}</Text>
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
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: 'center' },
  header: {
    marginBottom: 32 },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8 },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    lineHeight: 18 },
  form: {
    gap: 14 },
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
  loginBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 3 },
  googleBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center' },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1 },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 10 },
  registerText: {
    fontSize: 13 } });
