import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import api from '../services/api';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react-native';

export const HelpScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const user = useAuthStore((s) => s.user);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitEnquiry = async () => {
    if (!name.trim() || !message.trim()) {
      setErrorMsg('Full Name and Support Message are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.post('/enquiries', {
        name: name.trim(),
        email: email.trim() || 'arihantgold20@gmail.com',
        phone: user?.phone || '8591417443',
        subject: 'Contact Us / Support Enquiry',
        message: message.trim()
      });

      if (res.data?.success) {
        setSuccessMsg('Your message has been sent directly to Admin! Ref #' + (res.data.enquiry?.enquiryNumber || 'ENQ-OK'));
        setMessage('');
      } else {
        setErrorMsg(res.data?.message || 'Failed to send message.');
      }
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Error sending support message.');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (query: string) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="CONTACT US / HELP" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title Header */}
        <View style={styles.topHeader}>
          <Text style={[styles.mainTitle, { color: themeColors.foreground }]}>Contact Us / Help</Text>
          <Text style={[styles.mainSub, { color: themeColors.mutedForeground }]}>
            Have questions about our gold forming collections, custom orders, or require help with polish and repairs? Feel free to contact our team.
          </Text>
        </View>

        {/* Support Channels Section */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>Support Channels</Text>

          {/* Call Support Card */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.iconCircle}>
              <Phone size={18} color={themeColors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.foreground }]}>CALL SUPPORT</Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:+918591417443')}>
                <Text style={[styles.infoValue, { color: themeColors.accent }]}>+91 85914 17443</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Inquiry Card */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.iconCircle}>
              <Mail size={18} color={themeColors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.foreground }]}>EMAIL INQUIRY</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:arihantgold20@gmail.com')}>
                <Text style={[styles.infoValue, { color: themeColors.accent }]}>arihantgold20@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Head Office (Mumbai) Card */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={themeColors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.foreground }]}>HEAD OFFICE (MUMBAI)</Text>
              <Text style={[styles.addressText, { color: themeColors.mutedForeground }]}>
                Shop No.31/B, Saas Bahu Building, 3rd Floor, 51/53 Kalbadevi Rd, near GLITZ MALL, Vithalwadi, Kalbadevi, Mumbai, Maharashtra 400002
              </Text>
              <TouchableOpacity onPress={() => openMaps('Shop No.31/B Saas Bahu Building Kalbadevi Rd Mumbai 400002')} style={styles.mapLinkBtn}>
                <Text style={[styles.mapLinkText, { color: themeColors.accent }]}>📍 View on Google Maps</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nashik Branch Card */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={themeColors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.foreground }]}>NASHIK BRANCH</Text>
              <Text style={[styles.addressText, { color: themeColors.mutedForeground }]}>
                Shop No. 16, 1st Floor, Samarth Market, Nagarkar Lane, Saraf Bazaar, Nashik, Maharashtra 422001
              </Text>
              <TouchableOpacity onPress={() => openMaps('Samarth Market Nagarkar Lane Saraf Bazaar Nashik 422001')} style={styles.mapLinkBtn}>
                <Text style={[styles.mapLinkText, { color: themeColors.accent }]}>📍 View on Google Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Send Us a Message Form Card */}
        <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.formHeader, { color: themeColors.foreground }]}>Send Us a Message</Text>

          <View style={styles.fieldGap}>
            <Text style={[styles.label, { color: themeColors.mutedForeground }]}>FULL NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
          </View>

          <View style={styles.fieldGap}>
            <Text style={[styles.label, { color: themeColors.mutedForeground }]}>EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@address.com"
              keyboardType="email-address"
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
          </View>

          <View style={styles.fieldGap}>
            <Text style={[styles.label, { color: themeColors.mutedForeground }]}>SUPPORT MESSAGE</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="How can our support team help you today?"
              multiline
              numberOfLines={4}
              placeholderTextColor={themeColors.mutedForeground}
              style={[styles.inputMulti, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
          </View>

          {errorMsg ? <Text style={[styles.errText, { color: themeColors.destructive }]}>{errorMsg}</Text> : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color={themeColors.success} />
              <Text style={[styles.successText, { color: themeColors.success }]}>{successMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={loading}
            onPress={handleSubmitEnquiry}
            style={[styles.sendBtn, { backgroundColor: themeColors.accent }]}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.accentForeground} />
            ) : (
              <View style={styles.btnRow}>
                <Text style={[styles.sendBtnText, { color: themeColors.accentForeground }]}>SEND MESSAGE</Text>
                <Send size={15} color={themeColors.accentForeground} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scroll: {
    padding: 16,
    gap: 20
  },
  topHeader: {
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: 8,
    gap: 6
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1
  },
  mainSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  sectionBlock: {
    gap: 12
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContent: {
    flex: 1,
    gap: 2
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  addressText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  mapLinkBtn: {
    marginTop: 6
  },
  mapLinkText: {
    fontSize: 12,
    fontWeight: '800'
  },
  formCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14
  },
  formHeader: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  fieldGap: {
    gap: 6
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13
  },
  inputMulti: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top'
  },
  errText: {
    fontSize: 12,
    fontWeight: '600'
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 8
  },
  successText: {
    fontSize: 12,
    fontWeight: '700'
  },
  sendBtn: {
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1
  }
});

export default HelpScreen;
