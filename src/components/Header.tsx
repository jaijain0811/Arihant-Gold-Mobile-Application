import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import { BrandLogo } from './BrandLogo';
import { ShoppingBag, Heart, Wrench, Moon, Sun, Shield } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  navigation?: any;
}

export const Header: React.FC<HeaderProps> = ({ title, navigation }) => {
  const { theme, toggleTheme } = useThemeStore();
  const themeColors = colors[theme];
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'arihantgold20@gmail.com' || user?.email?.toLowerCase() === 'jaijain1466@gmail.com';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
      <View style={styles.titleContainer}>
        {title ? (
          <Text style={[styles.title, { color: themeColors.foreground }]}>{title}</Text>
        ) : (
          <BrandLogo size="small" showText={true} />
        )}
      </View>

      <View style={styles.actions}>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: 'rgba(212,175,55,0.18)', borderRadius: 8 }]}
            onPress={() => navigation?.navigate('AdminPortal')}
          >
            <Shield size={20} color={themeColors.accent} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
          {theme === 'dark' ? (
            <Sun size={20} color={themeColors.accent} />
          ) : (
            <Moon size={20} color={themeColors.foreground} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.navigate('ServiceBooking')}>
          <Wrench size={20} color={themeColors.accent} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.navigate('Wishlist')}>
          <Heart size={20} color={themeColors.foreground} />
          {wishlistCount > 0 && (
            <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.badgeTextCount, { color: themeColors.accentForeground }]}>{wishlistCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.navigate('Cart')}>
          <ShoppingBag size={20} color={themeColors.foreground} />
          {itemCount > 0 && (
            <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.badgeTextCount, { color: themeColors.accentForeground }]}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeTextCount: {
    fontSize: 10,
    fontWeight: '800',
  },
});
