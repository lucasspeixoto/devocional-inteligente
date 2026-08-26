import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBooks } from "@/hooks/useBooks";
import { typography } from "@/constants/typography";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocalBook } from "@/types";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInLeft } from "react-native-reanimated";

const GROUP_ORDER = [
  "Pentateuco",
  "Históricos",
  "Poéticos",
  "Profetas Maiores",
  "Profetas Menores",
  "Evangelhos",
  "Cartas de Paulo",
  "Cartas Gerais",
  "Profecia",
];

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function BooksListScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { books, loading, error, refresh } = useBooks();
  const [searchText, setSearchText] = useState("");
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "VT" | "NT">(
    "ALL",
  );

  // Filter and group books
  const sections = useMemo(() => {
    if (books.length === 0) return [];

    let filtered = books;

    // Apply testament filter
    if (testamentFilter !== "ALL") {
      filtered = filtered.filter((b) => b.testament === testamentFilter);
    }

    // Apply search filter
    if (searchText.trim() !== "") {
      const query = normalizeString(searchText);
      filtered = filtered.filter(
        (b) =>
          normalizeString(b.name).includes(query) ||
          normalizeString(b.abbrev_pt).includes(query),
      );
    }

    // Group books by group_name
    const groups: Record<string, LocalBook[]> = {};
    for (const book of filtered) {
      const gName = book.group_name || "Outros";
      if (!groups[gName]) {
        groups[gName] = [];
      }
      groups[gName].push(book);
    }

    // Map to SectionList structure and sort by canonical GROUP_ORDER
    const sectionList = Object.keys(groups)
      .map((title) => ({
        title,
        data: groups[title],
      }))
      .sort((a, b) => {
        const indexA = GROUP_ORDER.indexOf(a.title);
        const indexB = GROUP_ORDER.indexOf(b.title);
        const posA = indexA === -1 ? 999 : indexA;
        const posB = indexB === -1 ? 999 : indexB;
        return posA - posB;
      });

    return sectionList;
  }, [books, searchText, testamentFilter]);

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <LoadingIndicator message="Carregando livros..." />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ErrorState
          message="Não foi possível carregar o conteúdo bíblico local."
          onRetry={refresh}
        />
      </View>
    );
  }

  const handleBookPress = (abbrev: string) => {
    router.push(`/books/${abbrev}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            typography.heading1,
            { color: colors.textPrimary },
          ]}
        >
          Livros
        </Text>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar livro ou abreviação..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            style={[
              styles.searchInput,
              typography.body,
              { color: colors.textPrimary },
            ]}
          />
          {searchText !== "" && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Segmented Filter */}
        <View style={[styles.filterBar, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              testamentFilter === "ALL" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTestamentFilter("ALL")}
          >
            <Text
              style={[
                styles.filterText,
                typography.label,
                {
                  color:
                    testamentFilter === "ALL"
                      ? "#FFFFFF"
                      : colors.textSecondary,
                },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              testamentFilter === "VT" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTestamentFilter("VT")}
          >
            <Text
              style={[
                styles.filterText,
                typography.label,
                {
                  color:
                    testamentFilter === "VT" ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              Velho Test.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              testamentFilter === "NT" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTestamentFilter("NT")}
          >
            <Text
              style={[
                styles.filterText,
                typography.label,
                {
                  color:
                    testamentFilter === "NT" ? "#FFFFFF" : colors.textSecondary,
                },
              ]}
            >
              Novo Test.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.abbrev_pt}
        renderSectionHeader={({ section: { title } }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: colors.background },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                typography.label,
                { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInLeft.delay(index * 40).duration(300)}>
            <TouchableOpacity
              style={[
                styles.bookItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => handleBookPress(item.abbrev_pt)}
              activeOpacity={0.7}
            >
              <View style={styles.bookInfo}>
                <View
                  style={[
                    styles.abbrevBadge,
                    { backgroundColor: `${colors.secondary}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.abbrevText,
                      typography.label,
                      { color: colors.primary, fontWeight: "700" },
                    ]}
                  >
                    {item.abbrev_pt}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.bookName,
                      typography.body,
                      { color: colors.textPrimary, fontWeight: "600" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {!!item.author && (
                    <Text
                      style={[
                        styles.bookAuthor,
                        typography.bodySmall,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Autor: {item.author}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.bookChapters}>
                <Text
                  style={[
                    styles.chaptersText,
                    typography.bodySmall,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.chapters} caps
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Nenhum livro encontrado"
            message="Tente ajustar sua pesquisa ou seus filtros de busca."
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 80 + insets.bottom },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 46,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    padding: 0,
  },
  filterBar: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  filterText: {
    fontWeight: "600",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  abbrevBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  abbrevText: {
    textTransform: "uppercase",
  },
  bookName: {
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
  },
  bookChapters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chaptersText: {
    fontSize: 12,
  },
});
