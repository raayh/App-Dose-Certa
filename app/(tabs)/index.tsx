import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { auth, db } from '@/services/firebaseConfig';
import { Medication } from '@/types/database';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars'
import { LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';


export default function HomeScreen() {
  const user = auth.currentUser;
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0]

  const calendarTheme = {
    calendarBackground: 'transparent',
    selectedDayBackgroundColor: 'transparent',
    selectedDayTextColor: '#65b874',
    todayTextColor: '#65b874',
    dayTextColor: '#333',
    textDayFontFamily: 'Poppins_400Regular',
    textDayHeaderFontFamily: 'Poppins_400Regular',
  };

  async function fecthMedications(){
    if (!user) return;

    try{
      const medicationQuery = query (
        collection(db, "medications"), // dizemos qual 'tabela' olhar
        where("user_id", "==", user.uid)
      )

      const querySnapshot = await getDocs(medicationQuery)
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Medication));

      setMedications(list);

    } catch(error) {
      Alert.alert("Erro", "Não foi possivelcarregar os dados. Tente novamente mais tarde") 
    } finally {
      setLoading(false)
    }
  }

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
  }, []);


  return (
    <CalendarProvider date={today}> 
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>  

        <View style={styles.calendarContainer}>
          <WeekCalendar 
            firstDay={1} 
            theme={calendarTheme}
          />
        </View>   

       <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#65b874ff" />
          ) : medications.length === 0 ? (
            // Caminho A: Lista Vazia!
            <>
              <Text style={styles.emptyText}>Você ainda não tem remédios cadastrados.</Text>
              <Text style={styles.arrow}>↓ Clique no + abaixo</Text>
            </>
          ) : (
            // Caminho B: Achei os remédios! 🎉
            <FlatList
              data={medications}
              keyExtractor={(item) => item.id || Math.random().toString()}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Ionicons> </Ionicons>
                  <View> 
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.type} • {item.timesPerDay}x ao dia</Text>
                  </View>
                </View>
              )}
            />
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
    alignItems: 'center',
    paddingBottom: 70
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 5,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  arrow: {
    fontSize: 14,
    color: '#65b874ff',
    marginTop: 10
  },
  listContent: {
    padding: 20,
    gap: 15,
    paddingBottom: 100 // Espaço extra para não esconder atrás do menu!
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  cardSubtitle: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Poppins_400Regular'
  }
});

