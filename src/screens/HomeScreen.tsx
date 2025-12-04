import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { removeToken } from '../storage/authStorage';

export default function HomeScreen({ navigation }: any) {
  const [mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [filteredMahasiswa, setFilteredMahasiswa] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const fetchMahasiswa = async () => {
    const snapshot = await getDocs(collection(db, "mahasiswa")); // ambil data koleksi mahasiswa dari Firestore
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMahasiswa(data);
    setFilteredMahasiswa(data);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchMahasiswa);
    return unsubscribe;
  }, [navigation]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredMahasiswa(mahasiswa);
    } else {
      const filtered = mahasiswa.filter((item) => {
        const nama = item.nama?.toLowerCase() || '';
        const nim = item.nim?.toLowerCase() || '';
        const query = text.toLowerCase();
        
        return nama.includes(query) || nim.includes(query);
      });
      setFilteredMahasiswa(filtered);
    }
  };

  async function hapusMahasiswa(id: string) { 
    await deleteDoc(doc(db, "mahasiswa", id));
    fetchMahasiswa();
  };

  const confirmLogout = async () => {
    await removeToken(); // hapus token dari AsyncStorage
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const openLogoutModal = () => {
    setLogoutModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeLogoutModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setLogoutModal(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>🎓</Text>
              </View>
              <View>
                <Text style={styles.title}>Data Mahasiswa</Text>
                <Text style={styles.subtitle}>
                  {mahasiswa.length} Mahasiswa Terdaftar
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={openLogoutModal}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutIcon}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={[
            styles.searchWrapper,
            isSearchFocused && styles.searchWrapperFocused
          ]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari mahasiswa (nama atau NIM)..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery !== '' && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate("AddMahasiswa")}
          activeOpacity={0.85}
        >
          <View style={styles.addButtonContent}>
            <View style={styles.addIconCircle}>
              <Text style={styles.addButtonIcon}>+</Text>
            </View>
            <Text style={styles.addButtonText}>Tambah Mahasiswa Baru</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={filteredMahasiswa}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.nama ? item.nama.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.nama}</Text>
                  <View style={styles.infoRow}>
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeLabel}>NIM</Text>
                      <Text style={styles.infoBadgeValue}>{item.nim}</Text>
                    </View>
                    <View style={[styles.infoBadge, styles.infoBadgeSecondary]}>
                      <Text style={styles.infoBadgeLabel}>Prodi</Text>
                      <Text style={styles.infoBadgeValue}>{item.prodi}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => navigation.navigate("EditMahasiswa", { item })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editButtonIcon}>✏️</Text>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => hapusMahasiswa(item.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteButtonIcon}>🗑️</Text>
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>
                  {searchQuery ? '🔍' : '📚'}
                </Text>
              </View>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Mahasiswa tidak ditemukan' : 'Belum ada data mahasiswa'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : 'Mulai tambahkan mahasiswa untuk melihat daftar di sini'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate("AddMahasiswa")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyButtonText}>+ Tambah Sekarang</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        <Modal
          transparent
          visible={logoutModal}
          onRequestClose={closeLogoutModal}
          animationType="none"
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalLogoutText}>LOGOUT</Text>
              </View>
              <Text style={styles.modalTitle}>Keluar dari Akun?</Text>
              <Text style={styles.modalMessage}>
                Apakah Anda yakin ingin keluar dari aplikasi?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={closeLogoutModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton}
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>Ya, Keluar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  wrapper: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  searchWrapperFocused: {
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  addButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  infoBadgeSecondary: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  infoBadgeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBadgeValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  editButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  editButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  deleteButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },

  modalLogoutText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    borderBottomWidth: 2,
    borderBottomColor: '#FECACA',
    paddingBottom: 6,
  },
});