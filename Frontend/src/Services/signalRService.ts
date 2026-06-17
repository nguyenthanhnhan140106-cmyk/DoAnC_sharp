import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const startSignalRConnection = async (token: string, onNotificationReceived: () => void) => {
    if (connection) return; // Prevent multiple connections

    // Sửa trực tiếp thành đường dẫn tương đối, Vite proxy sẽ tự động thêm ngrok host vào
    const hubUrl = '/hubs/notification';

    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => token,
            // Đảm bảo SignalR sử dụng WebSockets
            transport: signalR.HttpTransportType.WebSockets
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