import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'medium', showText = true }) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const dim = size === 'small' ? 34 : size === 'large' ? 64 : 44;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 20 : 15;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={{
          width: dim,
          height: dim,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: themeColors.accent,
        }}
        resizeMode="cover"
      />

      {showText && (
        <View style={styles.textColumn}>
          <Text style={[styles.brandTitle, { color: themeColors.foreground, fontSize }]}>
            ARIHANT GOLD
          </Text>
          <Text style={[styles.brandSub, { color: themeColors.accent }]}>
            24K FORMING JEWELLERY
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gemCrest: {
    borderWidth: 2,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#15120E',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  innerFacet: {
    width: '75%',
    height: '75%',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCenterText: {
    fontWeight: '900',
    letterSpacing: 0.5,
    transform: [{ rotate: '-45deg' }],
  },
  textColumn: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 1,
  },
});
