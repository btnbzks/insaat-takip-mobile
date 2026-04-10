import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Santiyeler() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [projeler, setProjeler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalGorunur, setModalGorunur] = useState(false);
  const [yeniProjeAd, setYeniProjeAd] = useState('');

  // SİSTEM BAŞLANGICI VE GÜVENLİK
  useEffect(() => {
    if (!userId) {
      // Çıkış yapıldıysa veya kimlik yoksa doğrudan yeni adresimiz olan login'e fırlatıyoruz
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      return () => clearTimeout(timer);
    } else {
      projeleriGetir();
    }
  }, [userId]);

  const projeleriGetir = () => {
    setYukleniyor(true);
    // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
    fetch(`https://insaat-takip.onrender.com/api/projeler/kullanici/${userId}`)
      .then(res => res.json())
      .then(data => { setProjeler(data); setYukleniyor(false); })
      .catch(err => { console.error(err); setYukleniyor(false); });
  };

  // KUSURSUZ ÇIKIŞ BUTONU
  const cikisYap = () => {
    Alert.alert("Çıkış", "Oturumu kapatmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: () => {
          // Çakışma çözüldü! Artık hedefimiz belli: /login
          // Alert kapanma animasyonuyla çarpışmasın diye minik bir mühlet veriyoruz
          setTimeout(() => {
            router.replace('/login');
          }, 150);
        }
      }
    ]);
  };

  const projeEkle = () => {
    if (!yeniProjeAd) return Alert.alert("Hata", "Şantiye adı boş olamaz!");
    // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
    fetch(`https://insaat-takip.onrender.com/api/projeler/kullanici/${userId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: yeniProjeAd, status: "AKTİF" })
    }).then(res => {
      if (res.ok) { setModalGorunur(false); setYeniProjeAd(''); projeleriGetir(); }
    });
  };

  const projeSil = (id: number) => {
    Alert.alert("Emin misin?", "Bu şantiyeyi silmek istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => {
          // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
          fetch(`https://insaat-takip.onrender.com/api/projeler/${id}`, { method: 'DELETE' }).then(res => { if (res.ok) projeleriGetir(); });
      }}
    ]);
  };

  const projeKartiCiz = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardStatus}>Durum: {item.status}</Text>
      </View>
      <TouchableOpacity style={styles.folderButton} onPress={() => router.push(`/detay/${item.id}` as any)}>
        <Text style={{ fontSize: 24 }}>📂</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => projeSil(item.id)}>
        <Text style={{ fontSize: 20 }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  // Uygulama ilk açıldığında beyaz ekranda kalmaması için şık bir yükleniyor ekranı
  if (!userId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#212529', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Text style={styles.headerText}>Şantiye Takip</Text>
        <TouchableOpacity onPress={cikisYap} style={styles.logoutButton}>
          <Text style={{ fontSize: 18 }}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {yukleniyor ? <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 20 }} /> : (
          <FlatList data={projeler} keyExtractor={(item) => item.id.toString()} renderItem={projeKartiCiz}
            ListEmptyComponent={<Text style={{ marginTop: 20, color: '#666', textAlign: 'center' }}>Sisteme kayıtlı şantiyeniz bulunmuyor.</Text>} />
        )}
      </View>
      <TouchableOpacity style={styles.fabButton} onPress={() => setModalGorunur(true)}><Text style={styles.fabIcon}>+</Text></TouchableOpacity>
      
      <Modal visible={modalGorunur} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Şantiye Ekle</Text>
            <TextInput style={styles.input} placeholder="Şantiye Adı" value={yeniProjeAd} onChangeText={setYeniProjeAd} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setModalGorunur(false)}><Text style={styles.buttonText}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#0d6efd'}]} onPress={projeEkle}><Text style={styles.buttonText}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#212529', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  content: { padding: 20, flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardStatus: { fontSize: 14, color: '#198754', fontWeight: 'bold' },
  folderButton: { marginRight: 15, padding: 5 },
  deleteButton: { padding: 5 },
  fabButton: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0d6efd', width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabIcon: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 15, marginBottom: 20, fontSize: 16 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});