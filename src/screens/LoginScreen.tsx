import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { saveToken } from "../storage/authStorage";
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scaleAnim] = useState(new Animated.Value(0));
  const [errorScaleAnim] = useState(new Animated.Value(0));

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Email dan password harus diisi!");
      setErrorModal(true);
      Animated.spring(errorScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await saveToken(userCredential.user.uid);
      
      setSuccessModal(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setSuccessModal(false);
          navigation.replace("Home");
        });
      }, 1500);
    } catch (err: any) {
      let message = "Terjadi kesalahan saat login.";

      if (err.code === "auth/invalid-credential") message = "Email atau password salah.";
      else if (err.code === "auth/user-not-found") message = "Akun tidak ditemukan.";
      else if (err.code === "auth/wrong-password") message = "Password Anda salah.";
      else if (err.code === "auth/network-request-failed") message = "Tidak ada koneksi internet.";

      setErrorMessage(message);
      setErrorModal(true);
      Animated.spring(errorScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.iconText}>🔐</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Selamat Datang</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda untuk melanjutkan</Text>
          </View>

          {/* Form Card dengan shadow */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password Anda"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, (isLoading || !email || !password) && styles.loginButtonDisabled]}
              disabled={isLoading || !email || !password}
              onPress={handleLogin}
            >
              <LinearGradient
                colors={(isLoading || !email || !password) ? ['#94A3B8', '#94A3B8'] : ['#6366F1', '#8B5CF6']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Masuk</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={errorModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.errorCard, { transform: [{ scale: errorScaleAnim }] }]}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>❌</Text>
            </View>
            <Text style={styles.errorTitle}>Login Gagal</Text>
            <Text style={styles.errorMsg}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => {
                Animated.timing(errorScaleAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => setErrorModal(false));
              }}
            >
              <Text style={styles.errorButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  wrapper: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 24 
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconText: {
    fontSize: 36,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    textAlign: "center", 
    marginBottom: 8, 
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 15, 
    textAlign: "center", 
    color: "#64748B", 
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  formCard: { 
    backgroundColor: "#FFFFFF", 
    padding: 24, 
    borderRadius: 20, 
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },

  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: { 
    color: "#FFFFFF", 
    fontSize: 17, 
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center",
    padding: 24,
  },

  successCard: { 
    backgroundColor: "#FFFFFF", 
    padding: 32, 
    borderRadius: 24, 
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 56,
  },
  successTitle: { 
    fontSize: 24, 
    fontWeight: "800", 
    marginBottom: 8,
    color: "#0F172A",
  },
  successMsg: { 
    color: "#64748B",
    fontSize: 15,
  },

  errorCard: { 
    backgroundColor: "#FFFFFF", 
    padding: 32, 
    borderRadius: 24, 
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 56,
  },
  errorTitle: { 
    fontSize: 24, 
    fontWeight: "800", 
    marginBottom: 8,
    color: "#0F172A",
  },
  errorMsg: { 
    color: "#64748B", 
    marginBottom: 20, 
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  errorButton: { 
    backgroundColor: "#EF4444", 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButtonText: { 
    color: "#FFFFFF", 
    fontWeight: "700",
    fontSize: 16,
  },
});