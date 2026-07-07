import React from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks/useSettings';
import { typography } from '@/constants/typography';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    version: selectedVersion,
    setVersion,
    versions,
    loading,
    error,
    refresh,
  } = useSettings();

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <LoadingIndicator message="Carregando configurações..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ErrorState message="Não foi possível obter as versões da Bíblia." onRetry={refresh} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
      <View style={styles.header}>
        <Text style={[styles.title, typography.heading1, { color: colors.textPrimary }]}>
          Configurações
        </Text>
      </View>

      <Animated.View entering={FadeInUp.duration(400)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, typography.label, { color: colors.textSecondary }]}>
              Aparência
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowLabel, typography.body, { color: colors.textPrimary }]}>
                Tema Escuro
              </Text>
              <Text style={[styles.rowSub, typography.bodySmall, { color: colors.textSecondary }]}>
                Alternar entre cores claras e escuras
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.secondaryLight }}
              thumbColor={isDark ? colors.secondary : '#f4f3f4'}
            />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="language-outline" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, typography.label, { color: colors.textSecondary }]}>
              Versão da Bíblia
            </Text>
          </View>

          <Text style={[styles.sectionSub, typography.bodySmall, { color: colors.textSecondary, marginBottom: 12 }]}>
            Selecione a tradução para leitura offline e online:
          </Text>

          <View style={styles.versionsList}>
            {versions.map((v) => {
              const isActive = v.version.toLowerCase() === selectedVersion.toLowerCase();
              return (
                <TouchableOpacity
                  key={v.version}
                  style={[
                    styles.versionItem,
                    {
                      borderColor: isActive ? colors.secondary : colors.border,
                      backgroundColor: isActive ? `${colors.secondary}15` : colors.surface,
                    },
                  ]}
                  onPress={() => setVersion(v.version)}
                  activeOpacity={0.7}
                >
                  <View style={styles.versionItemLeft}>
                    <Text
                      style={[
                        styles.versionText,
                        typography.label,
                        {
                          color: isActive ? colors.primary : colors.textPrimary,
                          fontWeight: isActive ? '700' : '500',
                          textTransform: 'uppercase',
                        },
                      ]}
                    >
                      {v.version}
                    </Text>
                    <Text style={[styles.versionSub, typography.bodySmall, { color: colors.textSecondary }]}>
                      {v.verses.toLocaleString('pt-BR')} versos
                    </Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, typography.bodySmall, { color: colors.textSecondary }]}>
          Devocional Inteligente v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0000000a',
    paddingBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  rowSub: {
    lineHeight: 16,
  },
  sectionSub: {
    lineHeight: 18,
  },
  versionsList: {
    gap: 8,
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  versionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versionText: {
    minWidth: 50,
  },
  versionSub: {
    fontSize: 12,
  },
  footer: {
    marginTop: 20,
    marginBottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
