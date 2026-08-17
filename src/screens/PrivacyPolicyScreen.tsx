import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { Shield, Lock, Trash2, Mail, ExternalLink } from 'lucide-react-native';

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="Privacy Policy" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.accent }]}>
            <Shield size={28} color={themeColors.accentForeground} />
          </View>
          <Text style={[styles.title, { color: themeColors.foreground }]}>
            Privacy Policy & Data Safety
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
            Last updated: July 30, 2026 | Effective immediately for Arihant Gold App users.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Lock size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
              1. Information We Collect
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: themeColors.mutedForeground }]}>
            Arihant Gold collects personal information you provide when registering or using our e-commerce jewelry services:
            {'\n'}• Account Credentials (Name, Email, Phone Number, Encrypted Password).
            {'\n'}• Delivery Addresses for order fulfillment.
            {'\n'}• Media Files & Photos (when submitting product repair requests, custom designs, or return proofs).
          </Text>
        </View>

        {/* Section 2 */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
              2. How We Use & Protect Your Data
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: themeColors.mutedForeground }]}>
            Your data is used strictly for:
            {'\n'}• Order processing, polishing & resizing service tracking, and invoice generation.
            {'\n'}• Secure authentication via encrypted JWT tokens and standard bcrypt password hashing.
            {'\n'}• Media storage hosted on Cloudinary CDN with HTTPS encryption.
            {'\n\n'}We do not sell, rent, or trade your personal data to any third-party advertisers.
          </Text>
        </View>

        {/* Section 3 - Google Play Policy Requirement */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Trash2 size={18} color={themeColors.destructive} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
              3. Account & Data Deletion
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: themeColors.mutedForeground }]}>
            In compliance with Google Play Developer Policy, you have the right to request deletion of your account and associated personal data at any time:
            {'\n\n'}• In-App Deletion: Navigate to Profile → "Delete Account" and confirm.
            {'\n'}• Email Deletion Request: Send an email to arihantgold20@gmail.com with subject "Account Deletion Request".
            {'\n\n'}Upon confirmation, your account, saved addresses, and active sessions will be permanently purged from our servers.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Mail size={18} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
              4. Privacy Enquiries & Support
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: themeColors.mutedForeground }]}>
            If you have questions regarding this Privacy Policy or your personal data, contact us at:
            {'\n'}Email: arihantgold20@gmail.com
            {'\n'}Phone: +91 8591417443
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
