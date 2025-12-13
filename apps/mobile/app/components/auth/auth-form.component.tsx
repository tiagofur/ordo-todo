import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import useAuthForm from "../../data/hooks/use-auth-form.hook";
import Logo from "../shared/logo.component";
import CustomTextInput from "../shared/text-input.component";
import PasswordInput from "../shared/password-input.component";
import CustomButton from "../shared/button.component";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

export default function AuthForm() {
  const colors = useThemeColors();
  const {
    mode,
    name,
    username,
    email,
    password,
    setName,
    setUsername,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  } = useAuthForm();

  const [confirmPassword, setConfirmPassword] = useState("");

  const logoScale = useSharedValue(0.8);
  const logoRotate = useSharedValue(0);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    score += checks.length ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.number ? 1 : 0;
    score += checks.special ? 1 : 0;

    if (score <= 2) return { score, label: "Débil", color: colors.error || "#ef4444", checks };
    if (score <= 3) return { score, label: "Media", color: colors.warning || "#f59e0b", checks };
    if (score <= 4) return { score, label: "Buena", color: colors.info || "#3b82f6", checks };
    return { score, label: "Excelente", color: colors.success || "#22c55e", checks };
  }, [password, colors]);

  // Password matching check
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12 });
    logoRotate.value = withSequence(
      withTiming(-5, { duration: 300 }),
      withTiming(5, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: "#FF6B6B" }]}>
      {/* Colorful geometric shapes */}
      <View style={[styles.shape, styles.shape1]} />
      <View style={[styles.shape, styles.shape2]} />
      <View style={[styles.shape, styles.shape3]} />
      <View style={[styles.shape, styles.shape4]} />
      <View style={[styles.shape, styles.shape5]} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoCircle}>
              <Feather name="check-square" size={60} color="#FF6B6B" />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={[styles.formContainer, { backgroundColor: "#FFFFFF" }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: "#1F2937" }]}>
                {mode === "login" ? "¡Hola de nuevo!" : "¡Únete a nosotros!"}
              </Text>
              <Text style={[styles.subtitle, { color: "#1F2937" }]}>
                {mode === "login"
                  ? "Inicia sesión en creapolis.dev 🚀"
                  : "Crea tu cuenta en creapolis.dev 🎨"}
              </Text>
            </View>

            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.form}
            >
              {mode === "register" && (
                <>
                  <Animated.View entering={FadeInDown.springify()}>
                    <CustomTextInput
                      label="Nome"
                      placeholder="Seu nome completo"
                      value={name}
                      onChangeText={setName}
                      leftIcon={
                        <Feather name="user" size={20} color={colors.textMuted} />
                      }
                    />
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <CustomTextInput
                      label="Nome de usuário"
                      placeholder="usuario123"
                      value={username}
                      onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      leftIcon={
                        <Feather name="at-sign" size={20} color={colors.textMuted} />
                      }
                      autoCapitalize="none"
                    />
                    <Text style={[styles.helperText, { color: colors.textMuted }]}>
                      Solo letras minúsculas, números, guiones y guiones bajos. Mínimo 3 caracteres.
                    </Text>
                  </Animated.View>
                </>
              )}

              <CustomTextInput
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                leftIcon={
                  <Feather name="mail" size={20} color={colors.textMuted} />
                }
              />

              <PasswordInput
                label="Senha"
                placeholder="Sua senha secreta"
                value={password}
                onChangeText={setPassword}
              />

              {/* Password Strength Indicator for Register Mode */}
              {mode === "register" && password && (
                <Animated.View entering={FadeInDown.springify()} style={styles.passwordStrength}>
                  <View style={styles.strengthHeader}>
                    <View style={styles.strengthBarContainer}>
                      <View
                        style={[
                          styles.strengthBar,
                          {
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                  <View style={styles.checksContainer}>
                    <View style={styles.checkItem}>
                      <Feather
                        name={passwordStrength.checks?.length ? "check-circle" : "circle"}
                        size={14}
                        color={passwordStrength.checks?.length ? colors.success : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          {
                            color: passwordStrength.checks?.length
                              ? colors.success
                              : colors.textMuted,
                          },
                        ]}
                      >
                        8+ caracteres
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Feather
                        name={passwordStrength.checks?.uppercase ? "check-circle" : "circle"}
                        size={14}
                        color={passwordStrength.checks?.uppercase ? colors.success : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          {
                            color: passwordStrength.checks?.uppercase
                              ? colors.success
                              : colors.textMuted,
                          },
                        ]}
                      >
                        Mayúsculas
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Feather
                        name={passwordStrength.checks?.number ? "check-circle" : "circle"}
                        size={14}
                        color={passwordStrength.checks?.number ? colors.success : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          {
                            color: passwordStrength.checks?.number
                              ? colors.success
                              : colors.textMuted,
                          },
                        ]}
                      >
                        Números
                      </Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Feather
                        name={passwordStrength.checks?.special ? "check-circle" : "circle"}
                        size={14}
                        color={passwordStrength.checks?.special ? colors.success : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.checkText,
                          {
                            color: passwordStrength.checks?.special
                              ? colors.success
                              : colors.textMuted,
                          },
                        ]}
                      >
                        Símbolos
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Confirm Password for Register Mode */}
              {mode === "register" && (
                <Animated.View entering={FadeInDown.springify()}>
                  <PasswordInput
                    label="Confirmar Senha"
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  {passwordsMatch && (
                    <View style={[styles.matchIndicator, { backgroundColor: "#D1FAE5", borderColor: "#22C55E" }]}>
                      <Feather name="check-circle" size={16} color="#22C55E" />
                      <Text style={[styles.matchText, { color: "#166534" }]}>
                        ¡Perfecto! Las contraseñas coinciden
                      </Text>
                    </View>
                  )}
                  {passwordsMismatch && (
                    <View style={[styles.matchIndicator, { backgroundColor: "#FEE2E2", borderColor: "#FF6B6B" }]}>
                      <Feather name="x-circle" size={16} color="#FF6B6B" />
                      <Text style={[styles.matchText, { color: "#991B1B" }]}>
                        ¡Las contraseñas no coinciden!
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}

              <CustomButton
                title={mode === "login" ? "Entrar" : "Cadastrar"}
                onPress={submit}
                style={styles.submitButton}
                icon={
                  <Feather
                    name={mode === "login" ? "log-in" : "user-plus"}
                    size={20}
                    color={colors.buttonPrimaryText}
                  />
                }
              />

              <View style={styles.divider}>
                <View
                  style={[styles.dividerLine, { backgroundColor: colors.border }]}
                />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                  OU
                </Text>
                <View
                  style={[styles.dividerLine, { backgroundColor: colors.border }]}
                />
              </View>

              <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  {mode === "login" ? (
                    <>
                      Não tem uma conta?{" "}
                      <Text style={[styles.toggleTextBold, { color: colors.primary }]}>
                        Cadastre-se
                      </Text>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{" "}
                      <Text style={[styles.toggleTextBold, { color: colors.primary }]}>
                        Entrar!
                      </Text>
                    </>
                  )}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.footer}
          >
            <View style={styles.securityBadge}>
              <Feather name="heart" size={16} color="#FFFFFF" />
              <Text style={[styles.securityText, { color: "#FFFFFF" }]}>
                Hecho con amor por creapolis.dev
              </Text>
              <Feather name="star" size={16} color="#FFFFFF" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shape: {
    position: "absolute",
  },
  shape1: {
    width: 120,
    height: 120,
    backgroundColor: "#4ECDC4",
    borderRadius: 24,
    transform: [{ rotate: "12deg" }],
    left: 20,
    top: 60,
  },
  shape2: {
    width: 90,
    height: 90,
    backgroundColor: "#FFE66D",
    borderRadius: 16,
    transform: [{ rotate: "45deg" }],
    right: 30,
    top: 120,
  },
  shape3: {
    width: 80,
    height: 80,
    backgroundColor: "#A8E6CF",
    borderRadius: 40,
    transform: [{ rotate: "6deg" }],
    left: 60,
    bottom: 100,
  },
  shape4: {
    width: 100,
    height: 100,
    backgroundColor: "#C7CEEA",
    borderRadius: 24,
    transform: [{ rotate: "-12deg" }],
    right: 20,
    bottom: 140,
  },
  shape5: {
    width: 70,
    height: 70,
    backgroundColor: "#FFDAC1",
    borderRadius: 12,
    transform: [{ rotate: "45deg" }],
    left: "50%",
    top: 80,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  formContainer: {
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 15,
    textAlign: "center",
  },
  toggleTextBold: {
    fontWeight: "800",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  passwordStrength: {
    marginTop: 12,
    gap: 12,
    padding: 16,
    backgroundColor: "#FFDAC1",
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#1F2937",
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "900",
    minWidth: 70,
    textAlign: "right",
    color: "#1F2937",
    textTransform: "uppercase",
  },
  checksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "48%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  checkText: {
    fontSize: 11,
    fontWeight: "700",
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});
