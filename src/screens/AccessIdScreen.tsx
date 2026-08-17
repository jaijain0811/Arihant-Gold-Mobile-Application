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
  Platform } from 'react-native';
import { useAccessStore } from '../store/accessStore';
import { accessCodeService } from '../services/accessCodeService';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { colors } from '../theme';
import { KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react-native';

export const AccessIdScreen = () => {
  const { theme } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = colors[theme];
  const setValidatedAccess = useAccessStore((s) => s.setValidatedAccess);

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleValidate = async () => {
    if (!inputCode.trim()) {
      setErrorMsg('Please enter your unique Access ID code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const result = await accessCodeService.validateCode(inputCode.trim());

      if (result.success && result.valid) {
        setSuccessMsg(result.message || 'Access ID validated successfully!');
        setTimeout(() => {
          setValidatedAccess(inputCode.trim());
        }, 600);
      } else {
        setErrorMsg(result.message || 'Invalid Access ID code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to security backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.centerBox}>
          {/* Logo & Security Crest */}
          <View style={[styles.iconContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <KeyRound size={40} color={themeColors.accent} />
          </View>

          <Text style={[styles.title, { color: themeColors.foreground }]}>{t('access_gate_title')}</Text>
          <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
            {t('access_gate_sub')}
          </Text>

          {/* Input Box */}
          <View style={styles.inputSection}>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
              <TextInput
                value={inputCode}
                onChangeText={(text) => {
                  setInputCode(text);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={t('enter_access_id')}
                placeholderTextColor={themeColors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { color: themeColors.foreground }]}
              />
            </View>

            {errorMsg ? (
              <View style={styles.alertBox}>
                <ShieldAlert size={16} color={themeColors.destructive} />
                <Text style={[styles.errorText, { color: themeColors.destructive }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.alertBox}>
                <CheckCircle2 size={16} color={themeColors.success} />
                <Text style={[styles.successText, { color: themeColors.success }]}>{successMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleValidate}
              style={[styles.submitBtn, { backgroundColor: themeColors.accent }]}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.accentForeground} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={[styles.submitBtnText, { color: themeColors.accentForeground }]}>
                    {t('unlock_catalog')}
                  </Text>
                  <ArrowRight size={18} color={themeColors.accentForeground} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Footer Note */}
          <View style={styles.footerNote}>
            <Text style={[styles.footerText, { color: themeColors.mutedForeground }]}>
              🔒 Protected by Arihant Gold Access Verification Backend. Codes can be revoked or updated dynamically by administrators.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24 },
  centerBox: {
    alignItems: 'center' },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
    paddingHorizontal: 16 },
  inputSection: {
    width: '100%',
    gap: 12 },
  inputWrapper: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center' },
  input: {
    fontSize: 15,
    fontWeight: '600' },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4 },
  errorText: {
    fontSize: 12,
    fontWeight: '600' },
  successText: {
    fontSize: 12,
    fontWeight: '600' },
  submitBtn: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3 },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1 },
  footerNote: {
    marginTop: 40,
    paddingHorizontal: 16 },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16 } });
