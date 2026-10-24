import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import CustomTextInput from "../shared/text-input.component";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface UsernameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  checkAvailability?: (username: string) => Promise<{ available: boolean; message?: string }>;
}

export default function UsernameInput({
  value,
  onChangeText,
  label = "Nome de usuário",
  placeholder = "usuario123",
  disabled = false,
  required = false,
  checkAvailability,
}: UsernameInputProps) {
  const colors = useThemeColors();
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isValid, setIsValid] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Reset validation state when value changes
    setIsValid(false);
    setIsAvailable(false);
    setValidationMessage("");

    // Don't validate empty or very short usernames
    if (!value || value.length < 3) {
      if (value && value.length > 0) {
        setValidationMessage("Mínimo 3 caracteres");
      }
      return;
    }

    // Basic format validation
    if (!/^[a-z0-9_-]+$/.test(value)) {
      setValidationMessage("Solo letras minúsculas, números, guiones y guiones bajos");
      return;
    }

    if (/^[-_]/.test(value) || /[-_]$/.test(value)) {
      setValidationMessage("No puede empezar o terminar con guión o guión bajo");
      return;
    }

    if (/--/.test(value) || /__/.test(value)) {
      setValidationMessage("No se permiten guiones o guiones bajos consecutivos");
      return;
    }

    if (value.length > 20) {
      setValidationMessage("Máximo 20 caracteres");
      return;
    }

    // Debounce API validation
    const timeout = setTimeout(async () => {
      if (!checkAvailability) {
        setIsValid(true);
        setValidationMessage("Formato válido");
        return;
      }

      setIsValidating(true);
      try {
        const result = await checkAvailability(value);
        setIsAvailable(result.available);

        if (result.available) {
          setIsValid(true);
          setValidationMessage("Nombre de usuario disponible ✓");
        } else {
          setIsValid(false);
          setValidationMessage(result.message || "Nombre de usuario no disponible");
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        setIsValid(true); // Assume valid if API check fails
        setValidationMessage("No se pudo verificar disponibilidad");
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, checkAvailability]);

  const handleChange = (text: string) => {
    // Force lowercase and valid characters only
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    onChangeText(sanitized);
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }

    if (!value || value.length < 3) {
      return null;
    }

    if (isValid && isAvailable) {
      return <Feather name="check-circle" size={20} color={colors.success || "#22c55e"} />;
    }

    if (!isValid || (isValid && !isAvailable)) {
      return <Feather name="x-circle" size={20} color={colors.error || "#ef4444"} />;
    }

    return <Feather name="alert-circle" size={20} color={colors.warning || "#f59e0b"} />;
  };

  const getMessageColor = () => {
    if (!value || value.length < 3) {
      return colors.textMuted || "#6b7280";
    }

    if (isValid && isAvailable) {
      return colors.success || "#22c55e";
    }

    if (!isValid || (isValid && !isAvailable)) {
      return colors.error || "#ef4444";
    }

    return colors.textMuted || "#6b7280";
  };

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <CustomTextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        disabled={disabled}
        leftIcon={<Feather name="at-sign" size={20} color={colors.textMuted} />}
        rightIcon={getValidationIcon()}
      />

      {/* Validation message */}
      {validationMessage && (
        <Text style={[styles.helperText, { color: getMessageColor() }]}>
          {validationMessage}
        </Text>
      )}

      {/* Requirements display when empty or focused */}
      {!value && (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          3-20 caracteres: letras minúsculas, números, guiones y guiones bajos
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
