import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  // --- GÜNCELLENEN: KAYIT OLMA FONKSİYONU ---
  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Hata", "Lütfen kayıt olmak için e-posta ve şifre yazın.");
    
    setLoading(true);
    try {
      // DÜZELTME: Java'nın beklediği "name" alanını da pakete ekledik
      const response = await fetch(`https://insaat-takip.onrender.com/api/users/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Yönetici", // Java'daki modele uygun olması için eklendi
          email: email.toLowerCase(),
          password: password
        })
      });

      if (response.ok) {
        Alert.alert("Mükemmel!", "Yönetici hesabın başarıyla oluşturuldu. Şimdi 'Giriş Yap' butonuna basarak içeri girebilirsin.");
      } else {
        const errorMsg = await response.text();
        Alert.alert("Kayıt Başarısız", errorMsg || "Sunucu kaydı reddetti. Lütfen verileri kontrol edin.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

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

        <TouchableOpacity 
          style={[styles.button, loading && { backgroundColor: '#555' }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        {/* GEÇİCİ KAYIT BUTONU */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#198754', marginTop: 15 }]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>İlk Kaydı Oluştur (Kayıt Ol)</Text>}
        </TouchableOpacity>

        {/* SÜPER ADMİN GİZLİ BUTONU (GEÇİCİ) */}
        <TouchableOpacity 
          style={{ backgroundColor: '#dc3545', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 30 }} 
          onPress={() => router.push('/admin')}
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
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});