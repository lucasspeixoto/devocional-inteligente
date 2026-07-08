import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { typography } from "@/constants/typography";

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {!!message && (
        <Text
          style={[
            styles.text,
            typography.bodySmall,
            { color: colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      )}
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
  text: {
    marginTop: 12,
    textAlign: "center",
  },
});
