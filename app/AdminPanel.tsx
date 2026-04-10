import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Switch, Text, View } from 'react-native';

export default function AdminPanel() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ŞİRKETLERİ SUNUCUDAN ÇEK
  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://insaat-takip.onrender.com/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      Alert.alert("Hata", "Şirket listesi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // 2. ŞALTERİ DEĞİŞTİR (Ödeme Kontrolü)
  const toggleCompanyStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`https://insaat-takip.onrender.com/api/companies/${id}/toggle-status`, {
        method: 'PUT'
      });
      if (response.ok) {
        // Listeyi yerelde güncelle ki anında değişsin
        setCompanies(companies.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      }
    } catch (error) {
      Alert.alert("Hata", "Durum güncellenemedi.");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0d6efd" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Süper Admin / Şirket Yönetimi</Text>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.companyCard}>
            <View>
              <Text style={styles.companyName}>{item.name}</Text>
              <Text style={styles.statusText}>
                {item.active ? "✅ Aktif (Ödeme Tamam)" : "❌ Pasif (Hesap Donduruldu)"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  companyCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1e1e1e', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  companyName: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  statusText: { fontSize: 14, color: '#888', marginTop: 4 }
});