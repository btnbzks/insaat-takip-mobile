import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Islem {
  id: number;
  description: string; 
  amount: number;      
  type: string;
}

export default function Finans() {
  const [islemler, setIslemler] = useState<Islem[]>([]);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);

  const [modalGorunur, setModalGorunur] = useState<boolean>(false);
  const [yeniAciklama, setYeniAciklama] = useState<string>('');
  const [yeniTutar, setYeniTutar] = useState<string>('');
  const [yeniTur, setYeniTur] = useState<string>('GİDER');
  const [duzenlenenIslemId, setDuzenlenenIslemId] = useState<number | null>(null);

  const finansGetir = () => {
    setYukleniyor(true);
    // DÜZELTİLDİ: Çift URL ve 8080 portu temizlendi
    fetch('https://insaat-takip.onrender.com/api/finans')
      .then(cevap => cevap.json())
      .then((veri: Islem[]) => { setIslemler(veri); setYukleniyor(false); })
      .catch(hata => { console.error("Finans çekilemedi:", hata); setYukleniyor(false); });
  };

  useEffect(() => { finansGetir(); }, []);

  const finansKaydet = () => {
    if (yeniAciklama.trim() === '' || yeniTutar.trim() === '') {
      Alert.alert('Hata', 'Açıklama ve tutar boş bırakılamaz!');
      return;
    }

    const finansPaketi = {
      description: yeniAciklama,
      amount: parseFloat(yeniTutar),
      type: yeniTur.toUpperCase()
    };

    // DÜZELTİLDİ: Çift URL ve 8080 portu temizlendi
    const url = duzenlenenIslemId 
      ? `https://insaat-takip.onrender.com/api/finans/${duzenlenenIslemId}` 
      : 'https://insaat-takip.onrender.com/api/finans';
    const metod = duzenlenenIslemId ? 'PUT' : 'POST';

    fetch(url, {
      method: metod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finansPaketi),
    })
    .then(cevap => {
      if (cevap.ok) {
        Alert.alert('Başarılı', duzenlenenIslemId ? 'İşlem güncellendi! 🔄' : 'İşlem eklendi! 💰');
        formuKapat();
        finansGetir();
      } else { Alert.alert('Hata', 'İşlem kaydedilemedi.'); }
    })
    .catch(hata => console.error("Kayıt hatası:", hata));
  };

  const islemSil = (id: number, aciklama: string) => {
    Alert.alert("Emin misin?", `"${aciklama}" işlemini silmek istediğine emin misin?`, [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", style: "destructive", 
          onPress: () => {
            // DÜZELTİLDİ: Çift URL ve 8080 portu temizlendi
            fetch(`https://insaat-takip.onrender.com/api/finans/${id}`, { method: 'DELETE' })
            .then(cevap => {
              if (cevap.ok) {
                Alert.alert('Silindi', 'Kasa işlemi silindi. 🗑️');
                finansGetir();
              } else { Alert.alert('Hata', 'Java motorunda silme komutu eksik!'); }
            }).catch(hata => console.error("Silme hatası:", hata));
          }
        }
    ]);
  };

  const yeniEkleModaliniAc = () => {
    setDuzenlenenIslemId(null);
    setYeniAciklama(''); setYeniTutar(''); setYeniTur('GİDER');
    setModalGorunur(true);
  };

  const duzenlemeModaliniAc = (item: Islem) => {
    setDuzenlenenIslemId(item.id);
    setYeniAciklama(item.description);
    setYeniTutar(item.amount.toString());
    setYeniTur(item.type);
    setModalGorunur(true);
  };

  const formuKapat = () => {
    setModalGorunur(false);
    setDuzenlenenIslemId(null);
    setYeniAciklama(''); setYeniTutar(''); setYeniTur('GİDER');
  };

  const islemKartiCiz = ({ item }: { item: Islem }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>📝 {item.description || "İşlem Kaydı"} ({item.type})</Text>
        <Text style={styles.cardAmount}>₺ {item.amount || "0"}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => duzenlemeModaliniAc(item)}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => islemSil(item.id, item.description)}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>💰 Kasa ve Finans</Text>
      </View>
      <View style={styles.content}>
        {yukleniyor ? (
          <ActivityIndicator size="large" color="#198754" style={{ marginTop: 20 }} />
        ) : (
          <FlatList data={islemler} keyExtractor={(item) => item.id.toString()} renderItem={islemKartiCiz} showsVerticalScrollIndicator={false} />
        )}
      </View>
      <TouchableOpacity style={styles.fabButton} onPress={yeniEkleModaliniAc}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalGorunur} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{duzenlenenIslemId ? 'İşlemi Düzenle' : 'Kasa İşlemi Ekle'}</Text>
            <TextInput style={styles.input} placeholder="Açıklama" value={yeniAciklama} onChangeText={setYeniAciklama} />
            <TextInput style={styles.input} placeholder="Tutar" value={yeniTutar} onChangeText={setYeniTutar} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Tür (GİDER veya GELİR)" value={yeniTur} onChangeText={setYeniTur} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={formuKapat}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: duzenlenenIslemId ? '#ffc107' : '#198754'}]} onPress={finansKaydet}>
                <Text style={styles.buttonText}>{duzenlenenIslemId ? 'Güncelle' : 'Kaydet'}</Text>
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
  header: { backgroundColor: '#198754', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20, flex: 1, paddingBottom: 80 },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: '#198754' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editButton: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#dee2e6' },
  deleteButton: { backgroundColor: '#ffeeeb', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ffc107' },
  actionText: { fontSize: 18 },
  fabButton: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#198754', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabIcon: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});