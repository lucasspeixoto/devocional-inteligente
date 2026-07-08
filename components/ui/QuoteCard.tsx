import React from "react";
import { StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { typography } from "@/constants/typography";

export function QuoteCard() {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(800).delay(400)}
      style={styles.quoteCard}
    >
      <Ionicons
        name="book"
        size={32}
        color={colors.secondaryLight}
        style={styles.quoteIcon}
      />
      <Text
        style={[
          styles.quoteText,
          typography.body,
          { color: colors.textPrimary, fontStyle: "italic" },
        ]}
      >
        &ldquo;Lâmpada para os meus pés é tua palavra, e luz para o meu
        caminho.&rdquo;
      </Text>
      <Text
        style={[
          styles.quoteAuthor,
          typography.bodySmall,
          { color: colors.textSecondary },
        ]}
      >
        Salmos 119:105
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quoteCard: {
    padding: 12,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E0D5C7",
    alignItems: "center",
    marginBottom: 40,
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontWeight: "600",
  },
});
