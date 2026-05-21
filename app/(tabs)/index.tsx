import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image, ScrollView} from 'react-native';
import { auth, db } from '@/services/firebaseConfig';
import { Medication } from '@/types/database';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars'
import { LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const medicationImages = {
  "Comprimido": require('@/assets/images/comprimido.png'),
  "Cápsula": require('@/assets/images/capsula.png'),
  "Gotas": require('@/assets/images/capsula.png'),
  "Xarope": require('@/assets/images/xarope.png'),
  "Injeção": require('@/assets/images/injeção.png'),
  "outros": require('@/assets/images/pote_comprimidos.png'),
}

export default function HomeScreen() {
  const user = auth.currentUser;
  const [medications, setMedications] = useState<(Medication & { time: string, status?: string })[]>([]);
  const [takeNow, setTakeNow] = useState<(Medication & { time: string, status?: string })[]>([]);
  const [upcoming, setUpcoming] = useState<(Medication & { id?: string, time: string, status?: string })[]>([]);
  const [selectedDate, setSelecteddate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  

  const calendarTheme = {
    calendarBackground: 'transparent',
    selectedDayBackgroundColor: 'transparent',
    selectedDayTextColor: '#65b874',
    todayTextColor: '#65b874',
    dayTextColor: '#333',
    textDayFontFamily: 'Poppins_500Medium',
    textDayHeaderFontSize: 15,
    textDayHeaderFontFamily: 'Poppins_600SemiBold',
    textDayFontSize: 16,
  };

  async function fecthMedications(){
    if (!user) return;

    try{
      // 1. BUSCA A "RECEITA" DO USUÁRIO
      const medicationQuery = query (
        collection(db, "medications"),
        where("user_id", "==", user.uid)
      )

      // 2. BUSCA O "DIÁRIO" DE HOJE (O Histórico)
      const historyQuery = query (
        collection(db, "history"),
        where("user_id", "==", user.uid),
        where("date", "==", selectedDate) // 👈 Agora usa a data selecionada!
      )

      // Executa as duas buscas ao mesmo tempo para ser rápido!
      const [medSnapshot, histSnapshot] = await Promise.all([
        getDocs(medicationQuery),
        getDocs(historyQuery)
      ]);

      // Mapeia a "Receita" E FILTRA POR DATA VALÍDA! (Correção do Bug 1)
      const list = medSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Medication)).filter(med => {
        // O remédio ainda não começou
        if (selectedDate < med.startDate) return false;
        // O tratamento já acabou
        if (med.endDate && selectedDate > med.endDate) return false;
        return true;
      });

      const historyMap: Record<string, 'taken' | 'skipped'> = {}
      histSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.medication_id}-${data.time}`;
        historyMap[key] = data.taken ? 'taken' : 'skipped';
      });

      const expanded = list.flatMap(med => 
        med.times.map(time => ({...med, time}))
      );

      // 🛑 O FILTRO DO MVP: Se tem no diário (tomou ou pulou), some da tela!
      const pendingMedications = expanded.filter(med => {
        const key = `${med.id}-${med.time}`;
        return !historyMap[key]; // Só deixa passar quem NÃO está no historyMap
      });

      pendingMedications.sort((a,b) => 
        a.time.localeCompare(b.time)
      );

      // 🕒 PEGANDO A HORA E DATA ATUAL (REAL) DO CELULAR
      const agora = new Date();
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      const horaAtual = `${hora}:${minuto}`;
      const hojeReal = agora.toISOString().split('T')[0];

      // ✂️ DIVIDINDO AS ÁGUAS (Correção do Bug 2)
      let praTomar: (Medication & { time: string, status?: string })[] = [];
      let paraDepois: (Medication & { time: string, status?: string })[] = [];

      if (selectedDate < hojeReal) {
        // PASSADO: Ninguém pode prever o futuro no passado. Tudo que sobrou está atrasado!
        praTomar = pendingMedications; 
      } else if (selectedDate > hojeReal) {
        // FUTURO: Ninguém tá atrasado ainda. Tudo é Próximos!
        paraDepois = pendingMedications;
      } else {
        // HOJE: Usa a regra do relógio!
        praTomar = pendingMedications.filter(med => med.time <= horaAtual);
        paraDepois = pendingMedications.filter(med => med.time > horaAtual);
      }

      setTakeNow(praTomar);
      setUpcoming(paraDepois);
      setMedications(pendingMedications); // Atualiza a lista geral segura

    } catch(error) {
      Alert.alert("Erro", "Não foi possivelcarregar os dados. Tente novamente mais tarde") 
    } finally {
      setLoading(false)
    }
  }

  const handleTakeMedication = async (item: Medication & { time: string }, isTaken: boolean) => {
    if (!user) return;
    
    try {
      // 1. Montamos o objeto perfeito que conversamos!
      const historyLog = {
        user_id: user.uid,
        medication_id: item.id || '',
        name: item.name,
        time: item.time,
        date: selectedDate, // 👈 Agora usa a data selecionada!
        taken: isTaken,
        taken_at: new Date().toISOString()
      };
      
      // 2. Salvamos na NOVA coleção "history"
      await addDoc(collection(db, "history"), historyLog);
      
      Alert.alert("Sucesso!", `${item.name} marcado como tomado! ✅`);
      
      // 3. Temporariamente: Vamos sumir com ele da tela "na força do ódio" (Estado Local)
      // até ensinarmos o fecthMedications a ler o histórico!
      setTakeNow(prev => prev.filter(med => med.time !== item.time || med.id !== item.id));

    } catch(error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível registrar o medicamento.");
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O vigilante do _layout.tsx vai te tirar daqui automaticamente!
    } catch (error) {
      Alert.alert("Erro ao sair", "Não foi possível deslogar.");
    }
  };

  useEffect(() => {
    // 👈 Aqui dentro você dá a partida no motor!
    fecthMedications();
  }, [selectedDate]); // 👈 A mágica: se selectedDate mudar, roda de novo!


  return (
    <CalendarProvider date={selectedDate}> 
      <View style={styles.container}>

        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>   */}

        <View style={styles.calendarContainer}>
          <WeekCalendar 
            firstDay={1} 
            theme={calendarTheme}
            onDayPress={(day: any) => setSelecteddate(day.dateString)} // 👈 Quando clica, muda a data!
          />
        </View>   

       <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#65b874ff" />
          ) : takeNow.length === 0 && upcoming.length === 0 ? (
            // Caminho A: Lista Vazia!
            <>
              <Text style={styles.emptyText}>Você ainda não tem remédios cadastrados.</Text>
              <Text style={styles.arrow}>↓ Clique no + abaixo</Text>
            </>
          ) : (
            // Caminho B: Achei os remédios! 🎉
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              
              {/* SESSÃO 1: TOMAR AGORA (Verde e Gigante) */}
              {takeNow.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Tomar agora</Text>
                  {takeNow.map((item, index) => (
                    <View key={(item.id || '') + index} style={[styles.card, styles.cardTakeNow]}>
                      
                      {/* 1º ANDAR: Imagem e Textos lado a lado */}
                      <View style={styles.cardTopRow}>
                        <Image source={medicationImages[item.type as keyof typeof medicationImages] || medicationImages["outros"]} style={styles.medicationImage}/>
                        <View style={styles.cardText}> 
                          <Text style={[styles.cardTitle, {color: '#FFF'}]}>{item.name}</Text>
                          <Text style={[styles.cardSubtitle, {color: '#E0F8E0'}]}>{item.type}{item.dosage ? `, ${item.dosage}` : ''}</Text>
                          <View style={styles.cardTime}>
                            <Ionicons name="time-outline" size={20} color="#FFF"/>
                            <Text style={[styles.cardSubtitle, {color: '#FFF', marginTop: 0}]}> {item.time}</Text>
                          </View>
                        </View>
                      </View>

                      {/* 2º ANDAR: Apenas os botões (Tudo aqui é pendente) */}
                      <View style={styles.cardButtonRow}>
                        <TouchableOpacity 
                          style={styles.saveButton}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            handleTakeMedication(item, true)
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="#65b874ff" />
                          ) : (
                            <Text style={styles.saveButtonText}>Tomado</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.skipButton}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            handleTakeMedication(item, false)
                          }}
                          disabled={loading}
                        >
                          <Text style={styles.skipButtonText}>Pular dose</Text>
                        </TouchableOpacity>
                      </View>
                      
                    </View>
                  ))}
                </>
              )}

              {/* SESSÃO 2: PRÓXIMOS (Brancos normais) */}
              {upcoming.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Próximos</Text>
                  {upcoming.map((item, index) => (
                    <View key={(item.id || '') + index} style={styles.card}>
                      <Image source={medicationImages[item.type as keyof typeof medicationImages] || medicationImages["outros"]} style={styles.medicationImage}/>
                      <View style={styles.cardText}> 
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardSubtitle}>{item.type}{item.dosage ? `, ${item.dosage}` : ''}</Text>
                        <View style={styles.cardTime}>
                          <Ionicons name="time-outline" size={20} color="#333"/>
                          <Text style={[styles.cardSubtitle, {marginTop: 0}]}> {item.time}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}

            </ScrollView>
          )}
        </View>

      </View>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F5',
    paddingTop: 30,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 70,
    paddingHorizontal: 24
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingTop: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  arrow: {
    fontSize: 14,
    color: '#65b874ff',
    marginTop: 10,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 0,
    gap: 15,
    paddingBottom: 100 
  },
  sectionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 24,
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    
    paddingVertical: 24,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: '100%',
    
    backgroundColor: '#FFF',

    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTakeNow: {
    backgroundColor: '#65b874ff', // Fundo Verde da imagem!
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  medicationImage: {
    width: 100,
    height: 100,
  },
  cardText: {
    gap: 5
  },
  cardTitle: {
    fontFamily: 'Poppins_500Medium', // Após instalar e carregar
    fontSize: 18,
    color: '#333',
    width: 180,
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
  saveButton:{
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 10,
    marginLeft: 24,
    paddingVertical: 4,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButtonText:{
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#65b874ff',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    gap: 15,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#FFF', 
    textDecorationLine: 'underline', 
    fontSize: 16,
  },
});

