import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const startSignalRConnection = async (token: string, onNotificationReceived: () => void) => {
    if (connection) return;

    const hubUrl = '/hubs/notification';

    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .build();

    connection.on('ReceiveNotification', () => {
        console.log('[SignalR] ReceiveNotification triggered');
        onNotificationReceived();
    });

    try {
        await connection.start();
        console.log('[SignalR] Connected successfully!');
    } catch (err) {
        console.error('[SignalR] Connection error:', err);
    }
};

export const stopSignalRConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
        console.log('[SignalR] Disconnected');
    }
};