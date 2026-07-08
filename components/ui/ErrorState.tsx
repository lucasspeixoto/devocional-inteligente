import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { typography } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text
        style={[
          styles.title,
          typography.heading2,
          { color: colors.textPrimary },
        ]}
      >
        Ops! Algo deu errado
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
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.buttonText, typography.label, { color: "#FFFFFF" }]}
          >
            Tentar Novamente
          </Text>
        </TouchableOpacity>
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
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontWeight: "bold",
  },
});
