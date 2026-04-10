import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Ustalar() {
  const [cariler, setCariler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);

  // Form Kutuları
  const [modalGorunur, setModalGorunur] = useState<boolean>(false);
  const [yeniAd, setYeniAd] = useState<string>('');
  const [yeniDetay, setYeniDetay] = useState<string>('');
  const [duzenlenenCariId, setDuzenlenenCariId] = useState<number | null>(null); // DÜZENLEME İÇİN EKLENDİ

  const carileriGetir = () => {
    setYukleniyor(true);
    // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
    fetch('https://insaat-takip.onrender.com/api/cariler')
      .then(cevap => cevap.json())
      .then(veri => {
        setCariler(veri);
        setYukleniyor(false);
      })
      .catch(hata => {
        console.error("Cariler çekilemedi:", hata);
        setYukleniyor(false);
      });
  };

  useEffect(() => {
    carileriGetir();
  }, []);

  const cariKaydet = () => {
    if (yeniAd.trim() === '') {
      Alert.alert('Hata', 'Lütfen usta veya firma adını boş bırakmayın!');
      return;
    }

    const yeniCariPaketi = {
      ad: yeniAd, isim: yeniAd, name: yeniAd, meslek: yeniDetay
    };

    // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
    const url = duzenlenenCariId 
      ? `https://insaat-takip.onrender.com/api/cariler/${duzenlenenCariId}` 
      : 'https://insaat-takip.onrender.com/api/cariler';
    const metod = duzenlenenCariId ? 'PUT' : 'POST';

    fetch(url, {
      method: metod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yeniCariPaketi),
    })
    .then(cevap => {
      if (cevap.ok) {
        Alert.alert('Başarılı', duzenlenenCariId ? 'Usta güncellendi! 🔄' : 'Usta eklendi! 👷');
        formuKapat();
        carileriGetir();
      } else {
        Alert.alert('Hata', 'Java motoru bu veriyi kabul etmedi.');
      }
    })
    .catch(hata => console.error("Kayıt hatası:", hata));
  };

  const cariSil = (id: number, isim: string) => {
    Alert.alert("Emin misin?", `${isim} kaydını tamamen silmek istediğine emin misin?`, [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", style: "destructive", 
          onPress: () => {
            // DÜZELTİLDİ: Çift URL ve 8080 portu tamamen temizlendi
            fetch(`https://insaat-takip.onrender.com/api/cariler/${id}`, { method: 'DELETE' })
            .then(cevap => {
              if (cevap.ok) {
                Alert.alert('Silindi', 'Kayıt temizlendi. 🗑️');
                carileriGetir();
              } else {
                Alert.alert('Hata', 'Java motorunda silme komutu eksik!');
              }
            }).catch(hata => console.error("Silme hatası:", hata));
          }
        }
    ]);
  };

  const yeniEkleModaliniAc = () => {
    setDuzenlenenCariId(null);
    setYeniAd('');
    setYeniDetay('');
    setModalGorunur(true);
  };

  const duzenlemeModaliniAc = (item: any) => {
    setDuzenlenenCariId(item.id);
    setYeniAd(item.ad || item.isim || item.name || item.unvan || '');
    setYeniDetay(item.meslek || item.telefon || item.tur || '');
    setModalGorunur(true);
  };

  const formuKapat = () => {
    setModalGorunur(false);
    setDuzenlenenCariId(null);
    setYeniAd('');
    setYeniDetay('');
  };

  const cariKartiCiz = ({ item }: { item: any }) => {
    const cariAdi = item.ad || item.isim || item.name || item.unvan || "İsimsiz Usta/Firma";
    const cariDetay = item.meslek || item.telefon || item.tur || "Sistem Kaydı Aktif";

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>👤 {cariAdi}</Text>
          <Text style={styles.cardStatus}>{cariDetay}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => duzenlemeModaliniAc(item)}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => cariSil(item.id, cariAdi)}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>👷 Ustalar ve Firmalar</Text>
      </View>
      <View style={styles.content}>
        {yukleniyor ? (
          <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 20 }} />
        ) : (
          <FlatList data={cariler} keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())} renderItem={cariKartiCiz} showsVerticalScrollIndicator={false} />
        )}
      </View>
      <TouchableOpacity style={styles.fabButton} onPress={yeniEkleModaliniAc}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalGorunur} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{duzenlenenCariId ? 'Kayıt Düzenle' : 'Yeni Usta/Firma Ekle'}</Text>
            <TextInput style={styles.input} placeholder="Ad veya Ünvan" value={yeniAd} onChangeText={setYeniAd} />
            <TextInput style={styles.input} placeholder="Meslek / Detay" value={yeniDetay} onChangeText={setYeniDetay} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={formuKapat}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: duzenlenenCariId ? '#ffc107' : '#0d6efd'}]} onPress={cariKaydet}>
                <Text style={styles.buttonText}>{duzenlenenCariId ? 'Güncelle' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#212529', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20, flex: 1, paddingBottom: 80 },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardStatus: { fontSize: 14, color: '#666' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editButton: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#dee2e6' },
  deleteButton: { backgroundColor: '#ffeeeb', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ffc107' },
  actionText: { fontSize: 18 },
  fabButton: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#212529', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabIcon: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});