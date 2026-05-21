// ⚠️ Import dinâmico: carrega a lib só quando a função é chamada
// Isso evita que o Expo Go trave ao abrir o arquivo

export async function requestNotificationPermission(): Promise<boolean> {
    try {
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch {
        // Expo Go não suporta — retorna false silenciosamente
        return false;
    }
}

export async function scheduleNotification(medicineName: string, time: string): Promise<void> {
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
        // Expo Go não suporta — falha silenciosa
    }
}


