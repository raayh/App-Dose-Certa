import React, {useState, useEffect} from 'react';
import { auth, db } from '@/services/firebaseConfig';
import {MedicationHistory} from '@/types/database';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { View, Text, StyleSheet, TouchableOpacity, Image, SectionList} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const medicationImages = {
  "Comprimido": require('@/assets/images/comprimido.png'),
  "Cápsula": require('@/assets/images/capsula.png'),
  "Gotas": require('@/assets/images/capsula.png'),
  "Xarope": require('@/assets/images/xarope.png'),
  "Injeção": require('@/assets/images/injeção.png'),
  "outros": require('@/assets/images/pote_comprimidos.png'),
}

export default function HistoryScreen() {
  const user = auth.currentUser;
  const [history, setHistory] =useState<{ 
    title: string; 
    data: (MedicationHistory & { type: string, dosage: string })[] 
  }[]>([]);
  const [totalRealToday, setTotalRealToday] = useState(0); // Começa em zero
  const [loading, setLoading] = useState(true);

  async function fetchHistory () {
    if (!user) return;

    try {
      const medQuery = query(
        collection(db, "medications"),
        where("user_id", "==", user.uid)
      );

      const histQuery = query (
        collection(db, "history"),
        where("user_id", "==", user.uid),
        orderBy("taken_at", "desc")
      );

      const [medSnapshot, histSnapshot] = await Promise.all([
        getDocs(medQuery),
        getDocs(histQuery)
      ]);

      const medMap: Record<string, any> = {};
      medSnapshot.docs.forEach(doc => {
        medMap[doc.id] = doc.data(); 
      })

            // 🧮 MOTOR MATEMÁTICO: SOMA DE DOSES ESPERADAS PARA HOJE
      const todayStr = new Date().toISOString().split('T')[0];
      let countExpected = 0;

      medSnapshot.docs.forEach(doc => {
        const med = doc.data();
        
        // 🛡️ Filtro de Segurança: Vê se o remédio já começou e se já não terminou!
        const isStarted = todayStr >= med.startDate;
        const isNotFinished = !med.endDate || todayStr <= med.endDate;

        if (isStarted && isNotFinished) {
          // Soma a quantidade de horários que esse remédio tem no dia!
          countExpected += med.times ? med.times.length : 0;
        }
      });

      setTotalRealToday(countExpected); // Guarda a soma real!

      const richHistory = histSnapshot.docs.map(doc => {
        const histData = doc.data() as MedicationHistory;; 
        const medInfo = medMap[histData.medication_id];

        return {
          id: doc.id,
          ...histData,
          type: medInfo?.type || 'outros',
          dosage: medInfo?.dosage || ''
        };
      });

           // 1. AGRUPAR EM MEMÓRIA POR DATA
      const groups: Record<string, any[]> = {};
      richHistory.forEach(item => {
        const dateKey = item.date;
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(item);
      });

      // 2. TRANSFORMAR O DICIONÁRIO NO FORMATO DO SECTIONLIST
      const sections = Object.keys(groups).map(date => {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterday = yesterdayObj.toISOString().split('T')[0];

        let title = date;
        if (date === today) title = "Hoje";
        else if (date === yesterday) title = "Ontem";
        else {
          const [year, month, day] = date.split('-');
          title = `${day}/${month}/${year}`;
        }

        return {
          title: title,
          data: groups[date]
        };
      });

      // 3. SALVAR O NOVO FORMATO E LIBERAR O LOADING
      setHistory(sections as any); 
      setLoading(false);

  
    } catch (error) {
      console.error("Erro no histórico:", error);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  // 1. Tenta encontrar se existe algum grupo chamado "Hoje" na nossa lista
  const todaySection = history.find((section: any) => section.title === "Hoje");

  // 2. 🛡️ O NOSSO ESCUDO: 
  // Se encontrou a seção "Hoje", pegamos os remédios dela. Se não encontrou nada, fingimos que é uma lista vazia []
  const todayData = todaySection ? todaySection.data : [];

  // 3. A MATEMÁTICA DINÂMICA:
  const totalToday = totalRealToday; // Quantos registros existem hoje
  const takenToday = todayData.filter((item: any) => item.taken).length; // Filtra e conta apenas os que tomou (true)


  return (
    <View style={styles.container}>

      <SectionList
        sections={history as any}
        keyExtractor={(item, index) => (item.id || '') + index}
        ListHeaderComponent={() => (
          <View>
            {/* 1. Seta e Título */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={30} />
              </TouchableOpacity>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.headerName}> Histórico </Text>
              </View>
            </View>
            {/* 2. O Banner Verde */}
            <View style={styles.banner}>
              <Ionicons name="checkmark-circle" size={24} color="#65b874ff" />
              <Text style={styles.bannerText}>
                {takenToday} de {totalToday} tomados hoje
              </Text>
            </View>
          </View>
        )}
        
        // 1. O que desenhar para CADA REMÉDIO (O seu card!)
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
              source={medicationImages[item.type as keyof typeof medicationImages] || medicationImages["outros"]} 
              style={styles.medicationImage}
            />
            
            <View style={[styles.cardText, { flex: 1 }]}> 
              <View style={styles.cardTextHeader}>
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{item.dosage ? `${item.dosage}` : ''}</Text>
              </View>
              <View style={styles.cardTime}>
                <Ionicons name="time-outline" size={20} color="#333"/>
                <Text style={[styles.cardSubtitle, {marginTop: 0}]}> {item.time}</Text>
              </View>
            </View>
           
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Ionicons 
                name={item.taken ? "checkmark" : "close"} 
                size={20} 
                color={item.taken ? "#65b874ff" : "#cc4b4b"} 
              />
              <Text style={{ 
                fontFamily: 'Poppins_600SemiBold', 
                color: item.taken ? "#65b874ff" : "#cc4b4b",
                fontSize: 12
              }}>
                {item.taken ? "Tomado" : "Não tomado"}
              </Text>
            </View>
          </View>
        )}

        // 2. O que desenhar para os TÍTULOS DOS GRUPOS (Hoje, Ontem, Datas)
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}

        // 3. Um espacinho de beleza entre cada card da lista
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        
        // Remove a barrinha de rolagem feia da lateral
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor: '#F4F6F5',
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 25,
  },
  header:{
    justifyContent: 'flex-start',
    flexDirection: 'column',
    gap: 18,
  },
  headerName:{
    fontFamily: 'Poppins_500Medium',
    fontSize: 24,
  },
    banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE', // Verde bem clarinho de fundo
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  bannerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: '100%',
    gap: 10,
    
    backgroundColor: '#FFF',

    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  medicationImage: {
    width: 50,
    height: 50,
  },
  cardText: {
    flex: 1,  // 👴 Acessibilidade: ocupa espaço sem empurrar o status
    gap: 5
  },
  cardTextHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  cardTitle: {
    fontFamily: 'Poppins_500Medium', // Após instalar e carregar
    fontSize: 18,
    color: '#333',
  },
  cardSubtitle: {
    color: '#777',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular'
  },
  cardTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

