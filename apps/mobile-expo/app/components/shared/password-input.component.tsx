import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import CustomTextInput from "./text-input.component";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Senha",
  label,
  error,
}: PasswordInputProps) {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <CustomTextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={!showPassword}
      error={error}
      leftIcon={
        <Feather name="lock" size={20} color={colors.textMuted} />
      }
      rightIcon={
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      }
    />
  );
}
