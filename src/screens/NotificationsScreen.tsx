import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet,  ActivityIndicator } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import api from '../services/api';
import { NotificationItem } from '../types';
import { Bell, Sparkles } from 'lucide-react-native';

export const NotificationsScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="ANNOUNCEMENTS" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.accent} />
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <View key={n.id} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.cardHeader}>
                <Sparkles size={16} color={themeColors.accent} />
                <Text style={[styles.title, { color: themeColors.foreground }]}>{n.title}</Text>
              </View>
              <Text style={[styles.msg, { color: themeColors.mutedForeground }]}>{n.message}</Text>
              <Text style={[styles.date, { color: themeColors.mutedForeground }]}>
                {new Date(n.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Bell size={40} color={themeColors.mutedForeground} />
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>No notifications yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16,
    gap: 12 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  title: {
    fontSize: 14,
    fontWeight: '800' },
  msg: {
    fontSize: 12,
    lineHeight: 18 },
  date: {
    fontSize: 10,
    marginTop: 4 },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12 },
  emptyText: {
    fontSize: 13 } });
