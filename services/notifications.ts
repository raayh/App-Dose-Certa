import Constants from 'expo-constants';

// Detecta se está rodando no Expo Go (que não suporta expo-notifications no SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

export async function requestNotificationPermission(): Promise<boolean> {
    if (isExpoGo) return false; // Pula silenciosamente no Expo Go

    try {
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch {
        return false;
    }
}

export async function scheduleNotification(medicineName: string, time: string): Promise<void> {
    if (isExpoGo) return; // Pula silenciosamente no Expo Go

    try {
        const Notifications = await import('expo-notifications');
        const [hours, minutes] = time.split(':').map(Number);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💊 Hora do remédio!',
                body: `Está na hora de tomar ${medicineName}`,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
        });
    } catch {
        // Falha silenciosa
    }
}



