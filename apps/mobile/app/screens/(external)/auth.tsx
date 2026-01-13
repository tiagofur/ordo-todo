import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { AuthForm } from "@ordo-todo/ui";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { 
  checkBiometricCapabilities, 
  loginWithBiometrics, 
  isBiometricLoginEnabled,
  getBiometricIconName,
  getBiometricTypeName
} from "@/app/lib/biometric-auth";
import { apiClient } from "@/app/lib/api-client";

export default function Auth() {
  const [isBioAvailable, setIsBioAvailable] = useState(false);
  const [bioType, setBioType] = useState<'fingerprint' | 'facial' | 'iris'>('fingerprint');
  const [isBioLoading, setIsBioLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkBiometrics();
  }, []);

  async function checkBiometrics() {
    try {
      const caps = await checkBiometricCapabilities();
      const enabled = await isBiometricLoginEnabled();
      
      if (caps.available && caps.enrolled && enabled) {
          setIsBioAvailable(true);
          if (caps.biometricTypes.length > 0) {
              setBioType(caps.biometricTypes[0]);
          }
          
          // Trigger biometric prompt automatically if enabled
          // This is standard behavior for biometrics in banking/secure apps
          handleBiometricLogin();
      }
    } catch (e) {
      console.warn("Failed to check biometrics", e);
    }
  }

  async function handleBiometricLogin() {
    if (isBioLoading) return;
    setIsBioLoading(true);
    try {
        const result = await loginWithBiometrics();
        
        if (result.success && result.token) {
             const client = apiClient as any;
             
             // Refresh access token using the stored refresh token
             try {
                 // First set the refresh token so client has it (if needed for the refresh call internals)
                 if (client.tokenStorage) {
                    await client.tokenStorage.setRefreshToken(result.token);
                 }

                 // Call refresh endpoint to get new access token
                 const newTokens = await apiClient.refreshToken({ refreshToken: result.token });
                 
                 // Store new tokens
                 if (client.tokenStorage) {
                     await client.tokenStorage.setToken(newTokens.accessToken);
                     await client.tokenStorage.setRefreshToken(newTokens.refreshToken);
                 }
                 
                 // Update auth state by invalidating query
                 await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
                 
                 // Navigate to app
                 router.replace("/screens/(internal)/(tabs)" as any);
             } catch (refreshError) {
                 console.error("Token refresh failed", refreshError);
                 Alert.alert("Error", "Tu sesión ha expirado. Por favor inicia sesión con contraseña.");
                 // We don't disable biometrics here automatically, user might just need to re-login once with password to fix token? 
                 // Actually enabling biometrics again in settings is safer.
             }
        } else if (result.error) {
            // Don't alert if user cancelled, just stay on screen
            // "Autenticación cancelada por el usuario"
            if (!result.error.toLowerCase().includes("cancelada")) {
                Alert.alert("Error", result.error);
            }
        }
    } catch (error) {
        console.error("Biometric login error", error);
        Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
        setIsBioLoading(false);
    }
  }

  // Map icon name for MaterialCommunityIcons compatibility if needed
  const getIconName = () => {
      const name = getBiometricIconName(bioType);
      // Ensure compatibility if helper returns something mapped differently
      return name;
  };

  return (
    <View style={styles.container}>
      {isBioAvailable && (
        <View style={styles.bioContainer}>
             <TouchableOpacity 
                style={styles.bioButton} 
                onPress={handleBiometricLogin}
                disabled={isBioLoading}
             >
                {isBioLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <>
                        <MaterialCommunityIcons 
                            name={getIconName() as any} 
                            size={24} 
                            color="#FFFFFF" 
                        />
                        <Text style={styles.bioText}>
                            Ingresar con {getBiometricTypeName(bioType)}
                        </Text>
                    </>
                )}
             </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.formContainer}>
          <AuthForm />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bioContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 0,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF', // Primary color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
    justifyContent: 'center',
  },
  bioText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  }
});
