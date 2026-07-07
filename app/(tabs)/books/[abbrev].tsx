import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getBookByAbbrev, updateBookComment } from '@/services/repositories/booksRepository';
import { getBookDetails as fetchBookDetailsFromApi } from '@/services/api';
import { LocalBook } from '@/types';
import { typography } from '@/constants/typography';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ErrorState } from '@/components/ui/ErrorState';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 24) / 5; // 5 columns in the grid

export default function BookDetailsScreen() {
  const { abbrev } = useLocalSearchParams<{ abbrev: string }>();
  const db = useDatabase();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<LocalBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!abbrev) return;
    setLoading(true);
    setError(null);
    try {
      let localBook = await getBookByAbbrev(db, abbrev);
      
      if (localBook && !localBook.comment) {
        // Fetch details from API to get the comment field
        try {
          const apiDetails = await fetchBookDetailsFromApi(abbrev);
          if (apiDetails.comment) {
            await updateBookComment(db, abbrev, apiDetails.comment);
            localBook = await getBookByAbbrev(db, abbrev);
          }
        } catch (apiErr) {
          console.warn('API error fetching book details (comment):', apiErr);
          // Non-blocking: continue displaying basic info if API fails
        }
      }

      if (localBook) {
        setBook(localBook);
      } else {
        throw new Error('Livro não encontrado no banco local.');
      }
    } catch (err: any) {
      console.error('Error loading book details:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [db, abbrev]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <LoadingIndicator message="Carregando detalhes do livro..." />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ErrorState message={error?.message || 'Erro ao carregar detalhes.'} onRetry={loadDetails} />
      </View>
    );
  }

  const handleChapterPress = (chapNumber: number) => {
    router.push(`/reading/${book.abbrev_pt}/${chapNumber}`);
  };

  // Generate array [1, 2, ..., chapters]
  const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, typography.heading2, { color: colors.textPrimary }]}>
          Detalhes do Livro
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View entering={FadeInUp.duration(400)}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View>
              <Text style={[styles.bookName, typography.heading1, { color: colors.textPrimary }]}>
                {book.name}
              </Text>
              <Text style={[styles.bookSubtitle, typography.body, { color: colors.primary, fontWeight: '600' }]}>
                {book.group_name} • {book.testament === 'VT' ? 'Velho Testamento' : 'Novo Testamento'}
              </Text>
            </View>
            <View style={[styles.abbrevBadge, { backgroundColor: `${colors.secondary}20` }]}>
              <Text style={[styles.abbrevText, typography.heading2, { color: colors.primary, fontWeight: '700' }]}>
                {book.abbrev_pt}
              </Text>
            </View>
          </View>

          {!!book.author && (
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, typography.bodySmall, { color: colors.textSecondary }]}>
                Autor: {book.author}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, typography.bodySmall, { color: colors.textSecondary }]}>
              Capítulos: {book.chapters}
            </Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)}>
        <Card style={styles.commentCard}>
          <Text style={[styles.sectionTitle, typography.label, { color: colors.primary, fontWeight: '700', marginBottom: 8 }]}>
            Introdução / Comentário
          </Text>
          {book.comment ? (
            <View>
              <Text
                style={[styles.commentText, typography.body, { color: colors.textPrimary }]}
                numberOfLines={isExpanded ? undefined : 3}
              >
                {book.comment}
              </Text>
              <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.expandButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.expandButtonText, typography.label, { color: colors.secondary }]}>
                  {isExpanded ? 'Mostrar menos' : 'Ler introdução...'}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.commentText, typography.body, { color: colors.textSecondary, fontStyle: 'italic' }]}>
              Nenhuma informação adicional disponível para este livro.
            </Text>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.chaptersSection}>
        <Text style={[styles.sectionTitle, typography.label, { color: colors.primary, fontWeight: '700', marginBottom: 12 }]}>
          Selecione o Capítulo
        </Text>
        <View style={styles.grid}>
          {chaptersArray.map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.gridItem,
                {
                  width: COLUMN_WIDTH,
                  height: COLUMN_WIDTH,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleChapterPress(num)}
              activeOpacity={0.7}
            >
              <Text style={[styles.gridItemText, typography.label, { color: colors.textPrimary }]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  bookSubtitle: {
    fontSize: 14,
  },
  abbrevBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abbrevText: {
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
  commentCard: {
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  commentText: {
    lineHeight: 24,
  },
  chaptersSection: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  gridItemText: {
    fontWeight: 'bold',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  expandButtonText: {
    fontWeight: 'bold',
  },
});
