import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Switch } from 'react-native';

export default function Login() {
  // --- STATE KONTROLLERİ ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // SİHİRLİ ANAHTAR: Sayfa değiştirmeden admin panelini açar
  const router = useRouter();

  // --- ADMİN PANELİ STATE'LERİ ---
  const [companies, setCompanies] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);

  // --- ADMİN: ŞİRKETLERİ ÇEK ---
  const fetchCompanies = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch('https://insaat-takip.onrender.com/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      Alert.alert("Hata", "Şirket listesi alınamadı.");
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin paneli açıldığında verileri çek
  useEffect(() => {
    if (showAdmin) {
      fetchCompanies();
    }
  }, [showAdmin]);

  // --- ADMİN: ŞALTERİ DEĞİŞTİR ---
  const toggleCompanyStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`https://insaat-takip.onrender.com/api/companies/${id}/toggle-status`, {
        method: 'PUT'
      });
      if (response.ok) {
        setCompanies(companies.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      }
    } catch (error) {
      Alert.alert("Hata", "Durum güncellenemedi.");
    }
  };

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    
    setLoading(true);
    try {
      const response = await fetch(`https://insaat-takip.onrender.com/api/users/login?email=${email.toLowerCase()}&password=${password}`);
      if (response.ok) {
        const user = await response.json();
        router.replace({ pathname: "/(tabs)", params: { userId: user.id } });
      } else {
        const errorMsg = await response.text();
        Alert.alert("Giriş Başarısız", errorMsg || "E-posta veya şifre hatalı.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  // --- KAYIT OLMA FONKSİYONU ---
  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen kayıt olmak için e-posta ve şifre yazın.");
    
    setLoading(true);
    try {
      const response = await fetch(`https://insaat-takip.onrender.com/api/users/register`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Yönetici", email: email.toLowerCase(), password: password })
      });

      if (response.ok) {
        Alert.alert("Mükemmel!", "Yönetici hesabın başarıyla oluşturuldu.");
      } else {
        const errorMsg = await response.text();
        Alert.alert("Kayıt Başarısız", errorMsg || "Sunucu kaydı reddetti.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EKRAN 1: ADMİN PANELİ GÖRÜNÜMÜ (ROUTER KULLANMADAN)
  // ==========================================
  if (showAdmin) {
    return (
      <View style={styles.adminContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowAdmin(false)}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
        
        <Text style={styles.adminHeader}>Süper Admin Paneli</Text>
        
        {adminLoading ? (
          <ActivityIndicator size="large" color="#0d6efd" />
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={{color: 'white', textAlign: 'center'}}>Henüz kayıtlı şirket yok.</Text>}
            renderItem={({ item }) => (
              <View style={styles.companyCard}>
                <View>
                  <Text style={styles.companyName}>{item.name}</Text>
                  <Text style={styles.statusText}>
                    {item.active ? "✅ Aktif" : "❌ Pasif"}
                  </Text>
                </View>
                <Switch
                  value={item.active}
                  onValueChange={() => toggleCompanyStatus(item.id, item.active)}
                  trackColor={{ false: "#767577", true: "#198754" }}
                />
              </View>
            )}
          />
        )}
      </View>
    );
  }

  // ==========================================
  // EKRAN 2: NORMAL GİRİŞ GÖRÜNÜMÜ
  // ==========================================
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>İnşaat Takip</Text>
        <Text style={styles.subtitle}>Yönetici Paneli</Text>

        <TextInput 
          style={styles.input} 
          placeholder="E-posta" 
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput 
          style={styles.input} 
          placeholder="Şifre" 
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, loading && { backgroundColor: '#555' }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#198754', marginTop: 15 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>İlk Kaydı Oluştur</Text>}
        </TouchableOpacity>

        {/* SÜPER ADMİN GİZLİ BUTONU - ARTIK AYRI SAYFAYA GİTMEZ, AYNI EKRANDA AÇAR */}
        <TouchableOpacity 
          style={{ backgroundColor: '#dc3545', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 30 }} 
          onPress={() => setShowAdmin(true)} 
        >
          <Text style={styles.buttonText}>SÜPER ADMİN PANELİ</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#1e1e1e', borderRadius: 20, padding: 30, elevation: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#2c2c2c', borderRadius: 12, padding: 15, marginBottom: 15, color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#0d6efd', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  // Admin Paneli Stilleri
  adminContainer: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60, width: '100%' },
  adminHeader: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  companyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, marginBottom: 10 },
  companyName: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  statusText: { fontSize: 14, color: '#888', marginTop: 4 },
  backButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 20 },
  backButtonText: { color: 'white', fontWeight: 'bold' }
});