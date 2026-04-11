import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SekmeTipi = 'ustalar' | 'finans' | 'stok' | 'metraj';

export default function ProjeDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [aktifSekme, setAktifSekme] = useState<SekmeTipi>('ustalar');
  const [ustalar, setUstalar] = useState<any[]>([]);
  const [finans, setFinans] = useState<any[]>([]);
  const [stok, setStok] = useState<any[]>([]);
  const [planlananlar, setPlanlananlar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Modallar
  const [ustaModal, setUstaModal] = useState(false);
  const [odemeModal, setOdemeModal] = useState(false);
  const [finansModal, setFinansModal] = useState(false);
  const [ortakModal, setOrtakModal] = useState(false);
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [fotoModal, setFotoModal] = useState(false);
  const [manuelStokModal, setManuelStokModal] = useState(false);
  const [manuelMetrajModal, setManuelMetrajModal] = useState(false);

  // State'ler
  const [seciliFotoUrl, setSeciliFotoUrl] = useState('');
  const [yeniUstaAd, setYeniUstaAd] = useState('');
  const [yeniUstaMeslek, setYeniUstaMeslek] = useState('');
  const [yeniAnlasilanTutar, setYeniAnlasilanTutar] = useState('');
  const [seciliUstaId, setSeciliUstaId] = useState<number | null>(null);
  const [yeniOdemeTutar, setYeniOdemeTutar] = useState('');
  const [yeniFinansAciklama, setYeniFinansAciklama] = useState('');
  const [yeniFinansTutar, setYeniFinansTutar] = useState('');
  const [yeniFinansTur, setYeniFinansTur] = useState<'GELİR' | 'GİDER'>('GİDER');
  const [seciliFinansId, setSeciliFinansId] = useState<number | null>(null);
  const [ortakEmail, setOrtakEmail] = useState('');
  const [yeniStokAd, setYeniStokAd] = useState('');
  const [yeniStokMiktar, setYeniStokMiktar] = useState('');
  const [yeniStokBirim, setYeniStokBirim] = useState('');
  const [yeniStokFiyat, setYeniStokFiyat] = useState('');
  const [yeniMetrajAd, setYeniMetrajAd] = useState('');
  const [yeniMetrajMiktar, setYeniMetrajMiktar] = useState('');
  const [yeniMetrajBirim, setYeniMetrajBirim] = useState('');

  const verileriGetir = () => {
    setYukleniyor(true);
    Promise.all([
      fetch(`https://insaat-takip.onrender.com/api/cariler/proje/${id}`).then(res => res.json()),
      fetch(`https://insaat-takip.onrender.com/api/finans/proje/${id}`).then(res => res.json()),
      fetch(`https://insaat-takip.onrender.com/api/stock/proje/${id}`).then(res => res.json()),
      fetch(`https://insaat-takip.onrender.com/api/metraj/proje/${id}`).then(res => res.json())
    ]).then(([ustalarData, finansData, stokData, metrajData]) => {
      setUstalar(ustalarData);
      setFinans(finansData);
      setStok(stokData);
      setPlanlananlar(metrajData);
      setYukleniyor(false);
    }).catch((err) => {
      console.error(err);
      setYukleniyor(false);
    });
  };

  useEffect(() => { verileriGetir(); }, [id]);

  const belgeYukleTetikle = (tur: 'irsaliye' | 'metraj') => {
    Alert.alert(`${tur === 'irsaliye' ? 'İrsaliye' : 'Metraj Raporu'} Tara`, "Yükleme yöntemini seçin:", [
      { text: "İptal", style: "cancel" },
      { text: "Kamera", onPress: () => fotoCek(tur) },
      { text: "Galeri", onPress: () => galeridenSec(tur) }
    ]);
  };

  const fotoCek = async (tur: 'irsaliye' | 'metraj') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Hata", "Kamera izni reddedildi!");
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) belgeFotoGonder(result.assets[0].uri, tur);
  };

  const galeridenSec = async (tur: 'irsaliye' | 'metraj') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Hata", "Galeri izni reddedildi!");
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) belgeFotoGonder(result.assets[0].uri, tur);
  };

  const belgeFotoGonder = async (uri: string, tur: 'irsaliye' | 'metraj') => {
    setYukleniyor(true);
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      const islenecekUri = compressedImage.uri;

      const formData = new FormData();
      let filename = islenecekUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename || '');
      let type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: islenecekUri,
        name: filename || `belge_${Date.now()}.jpg`,
        type: type
      } as any);

      const endpoint = tur === 'irsaliye'
        ? `https://insaat-takip.onrender.com/api/stock/proje/${id}/irsaliye`
        : `https://insaat-takip.onrender.com/api/metraj/proje/${id}/yukle`;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const mesaj = await res.text();
      setYukleniyor(false);

      if (res.ok) {
        Alert.alert("Yapay Zeka Başarılı!", "İrsaliye okundu ve sisteme kaydedildi.");
        verileriGetir();
      } else {
        Alert.alert("Hata Oluştu", mesaj);
      }
    } catch (err) {
      console.error(err);
      setYukleniyor(false);
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı.");
    }
  };

  const manuelStokKaydet = () => {
    if (!yeniStokAd || !yeniStokMiktar) return Alert.alert("Hata", "Ad ve miktar giriniz!");
    fetch(`https://insaat-takip.onrender.com/api/stock/proje/${id}/manuel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: yeniStokAd,
        quantity: parseFloat(yeniStokMiktar),
        unitType: yeniStokBirim || 'adet',
        pricePerUnit: parseFloat(yeniStokFiyat) || 0
      })
    }).then(res => {
      if (res.ok) {
        setManuelStokModal(false);
        setYeniStokAd(''); setYeniStokMiktar(''); setYeniStokBirim(''); setYeniStokFiyat('');
        verileriGetir();
      } else {
        Alert.alert("Hata", "Kayıt yapılamadı.");
      }
    });
  };

  const manuelMetrajKaydet = () => {
    if (!yeniMetrajAd || !yeniMetrajMiktar) return Alert.alert("Hata", "Ad ve miktar giriniz!");
    fetch(`https://insaat-takip.onrender.com/api/metraj/proje/${id}/manuel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: yeniMetrajAd,
        plannedQuantity: parseFloat(yeniMetrajMiktar),
        unitType: yeniMetrajBirim || 'adet'
      })
    }).then(res => {
      if (res.ok) {
        setManuelMetrajModal(false);
        setYeniMetrajAd(''); setYeniMetrajMiktar(''); setYeniMetrajBirim('');
        verileriGetir();
      } else {
        Alert.alert("Hata", "Kayıt yapılamadı.");
      }
    });
  };

  const ortakKaydet = () => {
    if (!ortakEmail) return;
    fetch(`https://insaat-takip.onrender.com/api/projeler/${id}/ortak-ekle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ortakEmail.toLowerCase())
    }).then(async res => {
      const mesaj = await res.text();
      if (res.ok) { Alert.alert("Başarılı", mesaj); setOrtakModal(false); setOrtakEmail(''); }
      else { Alert.alert("Hata", mesaj); }
    });
  };

  const ustaKaydet = () => {
    if (!yeniUstaAd || !yeniUstaMeslek) return Alert.alert("Hata", "Ad ve meslek giriniz!");
    fetch(`https://insaat-takip.onrender.com/api/cariler/proje/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: yeniUstaAd, meslek: yeniUstaMeslek, anlasilanTutar: parseFloat(yeniAnlasilanTutar) || 0 })
    }).then(res => { if (res.ok) { setUstaModal(false); setYeniUstaAd(''); setYeniUstaMeslek(''); setYeniAnlasilanTutar(''); verileriGetir(); } });
  };

  const ustaSil = (ustaId: number) => {
    Alert.alert("Ustayı Sil", "Bu ustayı şantiyeden çıkarmak istiyor musun?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => {
        fetch(`https://insaat-takip.onrender.com/api/cariler/${ustaId}`, { method: 'DELETE' }).then(res => { if (res.ok) verileriGetir(); });
      }}
    ]);
  };

  const odemeEkle = () => {
    fetch(`https://insaat-takip.onrender.com/api/cariler/${seciliUstaId}/odeme`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(yeniOdemeTutar) })
    }).then(res => { if (res.ok) { setOdemeModal(false); setYeniOdemeTutar(''); verileriGetir(); } });
  };

  const finansKaydet = () => {
    fetch(`https://insaat-takip.onrender.com/api/finans/proje/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: yeniFinansAciklama, amount: parseFloat(yeniFinansTutar), type: yeniFinansTur })
    }).then(res => { if (res.ok) { setFinansModal(false); setYeniFinansAciklama(''); setYeniFinansTutar(''); verileriGetir(); } });
  };

  const finansDuzenleKaydet = () => {
    fetch(`https://insaat-takip.onrender.com/api/finans/${seciliFinansId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: yeniFinansAciklama, amount: parseFloat(yeniFinansTutar), type: yeniFinansTur })
    }).then(res => { if (res.ok) { setDuzenleModal(false); setSeciliFinansId(null); setYeniFinansAciklama(''); setYeniFinansTutar(''); verileriGetir(); } });
  };

  const kasaOzetiCiz = () => {
    const tGelir = finans.filter(f => f.type === 'GELİR').reduce((t, f) => t + f.amount, 0);
    const tGider = finans.filter(f => f.type === 'GİDER').reduce((t, f) => t + f.amount, 0);
    const net = tGelir - tGider;
    return (
      <View style={styles.kasaOzetiContainer}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#198754', fontWeight: 'bold', fontSize: 14 }}>📈 Gelir: {tGelir} TL</Text>
          <Text style={{ color: '#dc3545', fontWeight: 'bold', marginTop: 4, fontSize: 14 }}>📉 Gider: {tGider} TL</Text>
        </View>
        <View style={styles.netDurumKutusu}>
          <Text style={{ fontSize: 10, color: '#666' }}>Net Durum</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: net >= 0 ? '#198754' : '#dc3545' }}>{net} TL</Text>
        </View>
      </View>
    );
  };

  const stokOzetiCiz = () => (
    <View style={styles.stokOzetiContainer}>
      <Text style={styles.stokOzetiYazisi}>İrsaliyelerden okunan <Text style={{fontWeight: 'bold'}}>{stok.length}</Text> kalem ürün var.</Text>
    </View>
  );

  const metrajOzetiCiz = () => (
    <View style={styles.metrajOzetiContainer}>
      <Text style={styles.metrajOzetiYazisi}>Proje bütçesinde planlanan toplam <Text style={{fontWeight: 'bold'}}>{planlananlar.length}</Text> hedef bulunuyor.</Text>
    </View>
  );

  const ustaKartiCiz = ({ item }: { item: any }) => {
    const toplamOdenen = item.payments?.reduce((toplam: number, odeme: any) => toplam + odeme.amount, 0) || 0;
    const kalan = (item.anlasilanTutar || 0) - toplamOdenen;
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><Text style={styles.cardTitle}>👤 {item.name}</Text><Text style={styles.cardStatus}>{item.meslek}</Text></View>
          <TouchableOpacity onPress={() => ustaSil(item.id)} style={styles.deleteUstaBtn}><Text style={{ fontSize: 20 }}>🗑️</Text></TouchableOpacity>
        </View>
        <View style={styles.hesapKutusu}>
          <Text style={styles.hesapSatiri}>Sözleşme: {item.anlasilanTutar} TL</Text>
          <Text style={[styles.hesapSatiri, {color: '#198754', marginTop: 5}]}>Toplam Ödenen: {toplamOdenen} TL</Text>
          <Text style={[styles.hesapSatiri, {fontWeight: 'bold', color: kalan > 0 ? '#dc3545' : '#198754'}]}>Kalan: {kalan} TL</Text>
        </View>
        <TouchableOpacity style={styles.odemeButton} onPress={() => { setSeciliUstaId(item.id); setOdemeModal(true); }}>
          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>+ Ödeme Ekle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const finansKartiCiz = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>📝 {item.description}</Text>
          <Text style={[styles.cardStatus, { color: item.type === 'GİDER' ? '#dc3545' : '#198754' }]}>{item.amount} TL ({item.type})</Text>
        </View>
        <TouchableOpacity onPress={() => { setSeciliFinansId(item.id); setYeniFinansAciklama(item.description); setYeniFinansTutar(item.amount.toString()); setYeniFinansTur(item.type); setDuzenleModal(true); }} style={styles.editBtn}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const stokKartiCiz = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setSeciliFotoUrl(item.irsaliyeImageName); setFotoModal(true); }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.cardTitle}>📦 {item.itemName}</Text>
          <Text style={styles.cardStatus}>Tarih: {new Date(item.deliveryDate).toLocaleDateString('tr-TR')}</Text>
          {item.pricePerUnit > 0 && <Text style={{fontSize: 11, color: '#198754', marginTop: 3}}>Birim Fiyat: {item.pricePerUnit} TL</Text>}
        </View>
        <View style={styles.stokMiktarKutusu}>
          <Text style={styles.stokMiktarYazisi}>{item.quantity}</Text>
          <Text style={{fontSize: 9}}>{item.unitType}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const metrajKartiCiz = ({ item }: { item: any }) => {
    const gerceklesenMiktar = stok.filter(s => {
      let hedefAd = item.itemName.toLowerCase().replace(/ø/g, 'q').replace(/i̇/g, 'i').trim();
      let stokAd = s.itemName.toLowerCase().replace(/ø/g, 'q').replace(/i̇/g, 'i').trim();
      if (stokAd.includes(hedefAd) || hedefAd.includes(stokAd)) return true;
      const capHedef = hedefAd.match(/q\d+(-q\d+)?/);
      const capStok = stokAd.match(/q\d+(-q\d+)?/);
      if (capHedef && capStok && capHedef[0] === capStok[0]) return true;
      return false;
    }).reduce((toplam, s) => toplam + s.quantity, 0);

    let yuzde = item.plannedQuantity > 0 ? (gerceklesenMiktar / item.plannedQuantity) * 100 : 0;
    if (yuzde > 100) yuzde = 100;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 {item.itemName}</Text>
        <View style={styles.metrajDetayRow}>
          <View>
            <Text style={{fontSize: 10, color: '#666'}}>Planlanan Hedef</Text>
            <Text style={{fontSize: 14, fontWeight: 'bold'}}>{item.plannedQuantity} {item.unitType}</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={{fontSize: 10, color: '#666'}}>Gelen (İrsaliye)</Text>
            <Text style={{fontSize: 14, fontWeight: 'bold', color: '#0d6efd'}}>{gerceklesenMiktar} {item.unitType}</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${yuzde}%`, backgroundColor: yuzde >= 100 ? '#198754' : '#0d6efd' }]} />
        </View>
        <Text style={{fontSize: 10, textAlign: 'right', marginTop: 4, color: yuzde >= 100 ? '#198754' : '#666'}}>
          {yuzde >= 100 ? '✅ Hedef Tamamlandı' : `%${yuzde.toFixed(1)} Tamamlandı`}
        </Text>
      </View>
    );
  };

  const getAktifListeData = () => {
    if (aktifSekme === 'ustalar') return ustalar;
    if (aktifSekme === 'finans') return finans;
    if (aktifSekme === 'stok') return stok;
    if (aktifSekme === 'metraj') return planlananlar;
    return [];
  };

  const getAktifHeader = () => {
    if (aktifSekme === 'finans') return kasaOzetiCiz();
    if (aktifSekme === 'stok') return stokOzetiCiz();
    if (aktifSekme === 'metraj') return metrajOzetiCiz();
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Şantiye Paneli</Text>
        <TouchableOpacity onPress={() => setOrtakModal(true)} style={styles.ortakButton}>
          <Text style={{ fontSize: 18 }}>👥</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, aktifSekme === 'ustalar' && styles.activeTab]} onPress={() => setAktifSekme('ustalar')}>
          <Text style={[styles.tabText, aktifSekme === 'ustalar' && styles.activeTabText]}>👷 Ustalar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, aktifSekme === 'finans' && styles.activeTab]} onPress={() => setAktifSekme('finans')}>
          <Text style={[styles.tabText, aktifSekme === 'finans' && styles.activeTabText]}>💰 Kasa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, aktifSekme === 'stok' && styles.activeTab]} onPress={() => setAktifSekme('stok')}>
          <Text style={[styles.tabText, aktifSekme === 'stok' && styles.activeTabText]}>📦 Gelen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, aktifSekme === 'metraj' && styles.activeTab]} onPress={() => setAktifSekme('metraj')}>
          <Text style={[styles.tabText, aktifSekme === 'metraj' && styles.activeTabText]}>📊 Hedef</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {yukleniyor ? <ActivityIndicator size="large" color="#0d6efd" /> :
          <FlatList
            data={getAktifListeData()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={aktifSekme === 'ustalar' ? ustaKartiCiz : (aktifSekme === 'finans' ? finansKartiCiz : (aktifSekme === 'stok' ? stokKartiCiz : metrajKartiCiz))}
            ListHeaderComponent={getAktifHeader()}
          />
        }
      </View>

      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: aktifSekme === 'ustalar' ? '#0d6efd' : (aktifSekme === 'finans' ? '#198754' : (aktifSekme === 'stok' ? '#6c757d' : '#8540f5')) }]}
        onPress={() => {
          if (aktifSekme === 'ustalar') setUstaModal(true);
          else if (aktifSekme === 'finans') setFinansModal(true);
          else if (aktifSekme === 'stok') {
            Alert.alert("Stok Ekle", "Yöntem seçin:", [
              { text: "İptal", style: "cancel" },
              { text: "📸 Fotoğrafla", onPress: () => belgeYukleTetikle('irsaliye') },
              { text: "✏️ Manuel", onPress: () => setManuelStokModal(true) }
            ]);
          } else {
            Alert.alert("Hedef Ekle", "Yöntem seçin:", [
              { text: "İptal", style: "cancel" },
              { text: "📸 Fotoğrafla", onPress: () => belgeYukleTetikle('metraj') },
              { text: "✏️ Manuel", onPress: () => setManuelMetrajModal(true) }
            ]);
          }
        }}
      >
        <Text style={styles.fabIcon}>{aktifSekme === 'stok' || aktifSekme === 'metraj' ? '📸' : '+'}</Text>
      </TouchableOpacity>

      <Modal visible={fotoModal} transparent={true} animationType="fade">
        <View style={styles.fullFotoContainer}>
          <TouchableOpacity style={styles.fotoKapatBtn} onPress={() => setFotoModal(false)}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>KAPAT ✖</Text>
          </TouchableOpacity>
          <Image source={{ uri: seciliFotoUrl }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>

      <Modal visible={ortakModal} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ortak Ekle</Text>
            <TextInput style={styles.input} placeholder="E-posta" value={ortakEmail} onChangeText={setOrtakEmail} autoCapitalize="none" />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#6c757d'}]} onPress={() => setOrtakModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#0d6efd'}]} onPress={ortakKaydet}><Text style={{color: 'white'}}>Ekle</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={ustaModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Usta Kaydı</Text>
            <TextInput style={styles.input} placeholder="Usta Adı" value={yeniUstaAd} onChangeText={setYeniUstaAd} />
            <TextInput style={styles.input} placeholder="Meslek" value={yeniUstaMeslek} onChangeText={setYeniUstaMeslek} />
            <TextInput style={styles.input} placeholder="Anlaşılan Tutar" value={yeniAnlasilanTutar} keyboardType="numeric" onChangeText={setYeniAnlasilanTutar} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setUstaModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#0d6efd'}]} onPress={ustaKaydet}><Text style={{color: 'white'}}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={odemeModal} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ödeme Ekle</Text>
            <TextInput style={styles.input} placeholder="Tutar" value={yeniOdemeTutar} keyboardType="numeric" onChangeText={setYeniOdemeTutar} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setOdemeModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#198754'}]} onPress={odemeEkle}><Text style={{color: 'white'}}>Öde</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={finansModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Kasa İşlemi</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.turButon, yeniFinansTur === 'GELİR' && {backgroundColor: '#198754'}]} onPress={() => setYeniFinansTur('GELİR')}><Text style={{color: yeniFinansTur === 'GELİR' ? 'white' : '#666'}}>GELİR</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.turButon, yeniFinansTur === 'GİDER' && {backgroundColor: '#dc3545'}]} onPress={() => setYeniFinansTur('GİDER')}><Text style={{color: yeniFinansTur === 'GİDER' ? 'white' : '#666'}}>GİDER</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Açıklama" value={yeniFinansAciklama} onChangeText={setYeniFinansAciklama} />
            <TextInput style={styles.input} placeholder="Tutar" value={yeniFinansTutar} keyboardType="numeric" onChangeText={setYeniFinansTutar} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setFinansModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#198754'}]} onPress={finansKaydet}><Text style={{color: 'white'}}>Ekle</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={duzenleModal} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Düzenle</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.turButon, yeniFinansTur === 'GELİR' && {backgroundColor: '#198754'}]} onPress={() => setYeniFinansTur('GELİR')}><Text style={{color: yeniFinansTur === 'GELİR' ? 'white' : '#666'}}>GELİR</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.turButon, yeniFinansTur === 'GİDER' && {backgroundColor: '#dc3545'}]} onPress={() => setYeniFinansTur('GİDER')}><Text style={{color: yeniFinansTur === 'GİDER' ? 'white' : '#666'}}>GİDER</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Açıklama" value={yeniFinansAciklama} onChangeText={setYeniFinansAciklama} />
            <TextInput style={styles.input} placeholder="Tutar" value={yeniFinansTutar} keyboardType="numeric" onChangeText={setYeniFinansTutar} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#6c757d'}]} onPress={() => setDuzenleModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#0d6efd'}]} onPress={finansDuzenleKaydet}><Text style={{color: 'white'}}>Güncelle</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={manuelStokModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Manuel Stok Ekle</Text>
            <TextInput style={styles.input} placeholder="Ürün Adı" value={yeniStokAd} onChangeText={setYeniStokAd} />
            <TextInput style={styles.input} placeholder="Miktar" value={yeniStokMiktar} keyboardType="numeric" onChangeText={setYeniStokMiktar} />
            <TextInput style={styles.input} placeholder="Birim (adet, kg, m² ...)" value={yeniStokBirim} onChangeText={setYeniStokBirim} />
            <TextInput style={styles.input} placeholder="Birim Fiyat (opsiyonel)" value={yeniStokFiyat} keyboardType="numeric" onChangeText={setYeniStokFiyat} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setManuelStokModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#6c757d'}]} onPress={manuelStokKaydet}><Text style={{color: 'white'}}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={manuelMetrajModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Manuel Hedef Ekle</Text>
            <TextInput style={styles.input} placeholder="Hedef Adı" value={yeniMetrajAd} onChangeText={setYeniMetrajAd} />
            <TextInput style={styles.input} placeholder="Planlanan Miktar" value={yeniMetrajMiktar} keyboardType="numeric" onChangeText={setYeniMetrajMiktar} />
            <TextInput style={styles.input} placeholder="Birim (adet, kg, m² ...)" value={yeniMetrajBirim} onChangeText={setYeniMetrajBirim} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#dc3545'}]} onPress={() => setManuelMetrajModal(false)}><Text style={{color: 'white'}}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#8540f5'}]} onPress={manuelMetrajKaydet}><Text style={{color: 'white'}}>Kaydet</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#212529', padding: 15, paddingTop: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 5 },
  backButtonText: { color: 'white', fontWeight: 'bold' },
  headerText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  ortakButton: { padding: 5 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', elevation: 2 },
  tabButton: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#212529' },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  activeTabText: { color: '#212529' },
  content: { padding: 15, flex: 1 },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: 'bold' },
  cardStatus: { fontSize: 12, color: '#666' },
  hesapKutusu: { backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginVertical: 8 },
  hesapSatiri: { fontSize: 11 },
  odemeButton: { backgroundColor: '#198754', padding: 8, borderRadius: 5, alignItems: 'center' },
  deleteUstaBtn: { padding: 5 },
  editBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 5 },
  kasaOzetiContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#212529', elevation: 3 },
  netDurumKutusu: { alignItems: 'flex-end', flex: 1 },
  stokOzetiContainer: { backgroundColor: '#e9ecef', padding: 10, borderRadius: 6, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  stokOzetiYazisi: { fontSize: 11, color: '#495057', textAlign: 'center' },
  metrajOzetiContainer: { backgroundColor: '#f3e8ff', padding: 10, borderRadius: 6, marginBottom: 10, borderWidth: 1, borderColor: '#d8b4fe' },
  metrajOzetiYazisi: { fontSize: 11, color: '#6b21a8', textAlign: 'center' },
  stokMiktarKutusu: { alignItems: 'center', backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, minWidth: 60 },
  stokMiktarYazisi: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  metrajDetayRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6 },
  progressBarBg: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  fabButton: { position: 'absolute', right: 20, bottom: 20, width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabIcon: { color: 'white', fontSize: 28 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 0.48, padding: 10, borderRadius: 6, alignItems: 'center' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  turButon: { flex: 0.48, padding: 10, borderRadius: 6, alignItems: 'center', backgroundColor: '#eee' },
  fullFotoContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '80%' },
  fotoKapatBtn: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }
});