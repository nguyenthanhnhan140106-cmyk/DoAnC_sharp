import API from './api';

export interface UserSearch {
    id: number;
    username: string;
    email: string;
}

export interface NotificationModel {
    id: number;
    userId: number;
    type: string;
    payload: string;
    isRead: boolean;
    createdAt: string;
}

export const searchUsers = async (keyword: string): Promise<UserSearch[]> => {
    const res = await API.get(`/auth/search-users?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
};

export const getMyNotifications = async (): Promise<NotificationModel[]> => {
    const res = await API.get('/notification/my-notifications');
    return res.data;
};

export const markAsRead = async (id: number): Promise<void> => {
    await API.put(`/notification/${id}/read`);
};

export const markAllAsRead = async () => {
    await API.put('/notification/read-all');
};

export const shareMedia = async (receiverId: number, mediaType: string, mediaId: number, mediaTitle: string, mediaCover: string, senderName: string, receiverName: string, message?: string) => {
    await API.post('/notification/share-media', {
        receiverId,
        mediaType,
        mediaId,
        mediaTitle,
        mediaCover,
        senderName,
        receiverName,
        message
    });
};
