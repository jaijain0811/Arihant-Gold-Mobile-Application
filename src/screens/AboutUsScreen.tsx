import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { Phone, Mail, ArrowRight } from 'lucide-react-native';

export const AboutUsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="ABOUT US" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Title Section */}
        <View style={styles.headerBlock}>
          <Text style={[styles.mainTitle, { color: themeColors.foreground }]}>Pioneers of Gold Forming</Text>
          <Text style={[styles.italicSub, { color: themeColors.accent }]}>Since 2020</Text>
        </View>

        {/* Story Paragraphs */}
        <View style={styles.storyBlock}>
          <Text style={[styles.paragraphText, { color: themeColors.mutedForeground }]}>
            Founded in 2020, Arihant Gold was established with a vision to make premium jewellery accessible without compromising on elegance, craftsmanship, or style. We specialize in high-quality gold-forming jewellery that offers the luxurious appearance of traditional gold at a more affordable price.
          </Text>

          <Text style={[styles.paragraphText, { color: themeColors.mutedForeground }]}>
            Our jewellery is crafted using advanced gold-forming techniques, where a durable base metal is finished with a premium gold layer to achieve a rich shine, long-lasting durability, and an elegant look. Each piece is carefully designed to provide the beauty of fine jewellery while remaining lightweight and comfortable for everyday wear.
          </Text>

          <Text style={[styles.paragraphText, { color: themeColors.mutedForeground }]}>
            Every mangalsutra, necklace, bangle, ring, and earring in our collection is thoughtfully designed, expertly hand-finished, and polished by skilled artisans inspired by India's rich jewellery heritage. From timeless classics to modern designs, Arihant Gold brings craftsmanship, quality, and affordability together in every creation.
          </Text>
        </View>

        {/* Visit Our Boutique Showroom Section Card */}
        <View style={[styles.showroomCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.tagline, { color: themeColors.accent }]}>COME EXPERIENCE THE SHINE</Text>
          <Text style={[styles.showroomTitle, { color: themeColors.foreground }]}>Visit Our Boutique Showroom</Text>
          <Text style={[styles.showroomDesc, { color: themeColors.mutedForeground }]}>
            Explore our full catalogue of forming mangalsutra, necklaces, bangles, and bridal ornaments in person. Meet our advisors, receive accurate estimates on customization bookings, and experience Arihant Gold quality firsthand.
          </Text>

          {/* Showroom Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.gridCol}>
              <Text style={[styles.colLabel, { color: themeColors.accent }]}>SHOWROOM HOURS</Text>
              <Text style={[styles.colVal, { color: themeColors.foreground }]}>Mon - Sat: 11:30 AM - 7:30 PM</Text>
              <Text style={[styles.colVal, { color: themeColors.mutedForeground }]}>Sunday: Closed</Text>
            </View>

            <View style={styles.gridCol}>
              <Text style={[styles.colLabel, { color: themeColors.accent }]}>HEAD OFFICE (MUMBAI)</Text>
              <Text style={[styles.colVal, { color: themeColors.foreground }]}>
                Shop No.31/B, Saas Bahu Building, 3rd Floor, Vithalwadi, Kalbadevi, Mumbai 400002
              </Text>
            </View>

            <View style={styles.gridCol}>
              <Text style={[styles.colLabel, { color: themeColors.accent }]}>NASHIK BRANCH</Text>
              <Text style={[styles.colVal, { color: themeColors.foreground }]}>
                Shop No. 16, Samarth Market, Nagarkar Lane, Saraf Bazaar, Nashik 422001
              </Text>
            </View>
          </View>

          {/* Instant Customer Support Sub-Card */}
          <View style={[styles.supportBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <Text style={[styles.supportHeader, { color: themeColors.foreground }]}>Instant Customer Support</Text>

            <TouchableOpacity onPress={() => Linking.openURL('tel:+918591417443')} style={styles.supportRow}>
              <Phone size={14} color={themeColors.accent} />
              <Text style={[styles.supportPhone, { color: themeColors.foreground }]}>+91 85914 17443</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL('mailto:arihantgold20@gmail.com')} style={[styles.supportRow, { marginTop: 4 }]}>
              <Mail size={14} color={themeColors.accent} />
              <Text style={[styles.supportEmail, { color: themeColors.foreground }]}>arihantgold20@gmail.com</Text>
            </TouchableOpacity>
          </View>

          {/* Browse Online Collections Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Home')}
            style={[styles.browseBtn, { backgroundColor: themeColors.accent }]}
          >
            <Text style={[styles.browseBtnText, { color: themeColors.accentForeground }]}>Browse Online Collections</Text>
            <ArrowRight size={16} color={themeColors.accentForeground} />
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
    padding: 18,
    gap: 24
  },
  headerBlock: {
    gap: 4
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 0.5
  },
  italicSub: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 2
  },
  storyBlock: {
    gap: 16
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.2
  },
  showroomCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 16
  },
  tagline: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  showroomTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: -8
  },
  showroomDesc: {
    fontSize: 12,
    lineHeight: 19
  },
  infoGrid: {
    gap: 14,
    marginTop: 6
  },
  gridCol: {
    gap: 4
  },
  colLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  colVal: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  supportBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 6
  },
  supportHeader: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'serif',
    marginBottom: 4
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  supportPhone: {
    fontSize: 12,
    fontWeight: '800'
  },
  supportEmail: {
    fontSize: 12,
    fontWeight: '700'
  },
  browseBtn: {
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  }
});

export default AboutUsScreen;
