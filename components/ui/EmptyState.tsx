import React, { ComponentProps } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { typography } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>["name"];
  title?: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "document-text-outline",
  title = "Nenhum resultado",
  message,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={64}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <Text
        style={[
          styles.title,
          typography.heading2,
          { color: colors.textPrimary },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          typography.body,
          { color: colors.textSecondary },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: {
    opacity: 0.6,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
  },
});
