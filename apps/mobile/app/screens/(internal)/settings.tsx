import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Palette, Clock, Bell, Globe, Info, Moon, Sun, Monitor } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '@ordo-todo/ui-mobile';
import { colors } from '@ordo-todo/styles/tokens';

const SETTINGS_KEY = 'ordo-mobile-settings';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    theme: 'system', // light, dark, system
    language: 'es',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    soundEnabled: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings({ ...settings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  };

  const SettingSection = ({ title, icon: Icon, color, children }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ label, description, rightElement }: any) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description && <Text style={styles.itemDescription}>{description}</Text>}
      </View>
      <View style={styles.itemRight}>
        {rightElement}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        
        {/* Appearance */}
        <SettingSection title="Appearance" icon={Palette} color="#3b82f6">
          <SettingItem
            label="Theme"
            description="Interface color scheme"
            rightElement={
              <View style={styles.themeSelector}>
                 <TouchableOpacity 
                    onPress={() => updateSetting('theme', 'light')}
                    style={[styles.themeOption, settings.theme === 'light' && styles.themeOptionActive]}
                 >
                    <Sun size={16} color={settings.theme === 'light' ? '#3b82f6' : colors.mutedForeground} />
                 </TouchableOpacity>
                 <TouchableOpacity 
                    onPress={() => updateSetting('theme', 'dark')}
                    style={[styles.themeOption, settings.theme === 'dark' && styles.themeOptionActive]}
                 >
                    <Moon size={16} color={settings.theme === 'dark' ? '#3b82f6' : colors.mutedForeground} />
                 </TouchableOpacity>
                 <TouchableOpacity 
                    onPress={() => updateSetting('theme', 'system')}
                    style={[styles.themeOption, settings.theme === 'system' && styles.themeOptionActive]}
                 >
                    <Monitor size={16} color={settings.theme === 'system' ? '#3b82f6' : colors.mutedForeground} />
                 </TouchableOpacity>
              </View>
            }
          />
        </SettingSection>

        {/* Timer */}
        <SettingSection title="Timer" icon={Clock} color="#f59e0b">
          <SettingItem
            label="Focus Duration"
            description="Minutes per pomodoro"
            rightElement={
                <View style={styles.counter}>
                    <TouchableOpacity 
                        onPress={() => updateSetting('workDuration', Math.max(5, settings.workDuration - 5))}
                        style={styles.counterBtn}
                    >
                        <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{settings.workDuration}</Text>
                    <TouchableOpacity 
                        onPress={() => updateSetting('workDuration', Math.min(60, settings.workDuration + 5))}
                        style={styles.counterBtn}
                    >
                        <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            }
          />
           <SettingItem
            label="Short Break"
            description="Minutes per short break"
            rightElement={
                <View style={styles.counter}>
                    <TouchableOpacity 
                        onPress={() => updateSetting('shortBreakDuration', Math.max(1, settings.shortBreakDuration - 1))}
                        style={styles.counterBtn}
                    >
                        <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{settings.shortBreakDuration}</Text>
                    <TouchableOpacity 
                        onPress={() => updateSetting('shortBreakDuration', Math.min(15, settings.shortBreakDuration + 1))}
                        style={styles.counterBtn}
                    >
                        <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            }
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications" icon={Bell} color="#ec4899">
          <SettingItem
            label="Enable Notifications"
            description="Get alerts when sessions end"
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(val) => updateSetting('notificationsEnabled', val)}
                trackColor={{ false: colors.muted, true: '#ec4899' }}
              />
            }
          />
          <SettingItem
            label="Sound Effects"
            description="Play sounds on timer completion"
            rightElement={
              <Switch
                value={settings.soundEnabled}
                onValueChange={(val) => updateSetting('soundEnabled', val)}
                trackColor={{ false: colors.muted, true: '#ec4899' }}
              />
            }
          />
        </SettingSection>

        {/* About */}
        <SettingSection title="About" icon={Info} color="#6b7280">
          <SettingItem
            label="Version"
            description="1.0.0 (Beta)"
            rightElement={null}
          />
        </SettingSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  itemRight: {
    marginLeft: 12,
  },
  themeSelector: {
      flexDirection: 'row',
      backgroundColor: colors.muted + '40',
      borderRadius: 8,
      padding: 2,
  },
  themeOption: {
      padding: 6,
      borderRadius: 6,
  },
  themeOptionActive: {
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
  },
  counter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.muted + '40',
      borderRadius: 8,
      padding: 4,
  },
  counterBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      backgroundColor: colors.card,
  },
  counterBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
  },
  counterValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
      minWidth: 20,
      textAlign: 'center',
  },
});
