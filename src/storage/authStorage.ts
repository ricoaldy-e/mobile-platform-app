// Fungsi AsyncStorage untuk menyimpan, mengambil, dan menghapus token autentikasi
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem("userToken", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("userToken");
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("userToken");
};