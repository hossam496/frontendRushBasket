import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(userId, role) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to socket server');

            if (userId) {
                this.socket.emit('join', userId);
            }

            if (role === 'admin') {
                this.socket.emit('join_admin_room');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from socket server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
        });

        return this.socket;
    }

    on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event) {
        if (!this.socket) return;
        this.socket.off(event);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
