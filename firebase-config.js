import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBNMwf-hrP2PLvJ6qubXV2ILLjAbcwSbyw",
    authDomain: "auth-4ac21.firebaseapp.com",
    projectId: "auth-4ac21",
    storageBucket: "auth-4ac21.firebasestorage.app",
    messagingSenderId: "415327194439",
    appId: "1:415327194439:web:692452c3e77d4da76c1062",
    measurementId: "G-50YMS5DTY9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Set persistence
try {
    await setPersistence(auth, browserLocalPersistence);
} catch (error) {
    console.error('Auth persistence error:', error);
}

// Enhanced auth state helper
function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            // Update last active timestamp
            updateUserProfile(user.uid, {
                lastActive: new Date().toISOString()
            }).catch(console.error);
        }
        callback(user);
    });
}

// Add user profile helpers
function getUserProfile(uid) {
    return new Promise((resolve, reject) => {
        const userRef = ref(db, `users/${uid}`);
        onValue(userRef, (snapshot) => {
            resolve(snapshot.val());
        }, (error) => {
            reject(error);
        });
    });
}

function updateUserProfile(uid, data) {
    const userRef = ref(db, `users/${uid}`);
    return set(userRef, {
        ...data,
        lastUpdated: new Date().toISOString()
    });
}

// Chat service functions
function createChatService() {
    const createConnection = async (userId1, userId2, rate) => {
        const chatId = `chat_${[userId1, userId2].sort().join('_')}`;
        const chatRef = ref(db, `chats/${chatId}`);
        await set(chatRef, {
            participants: [userId1, userId2],
            rate: rate,
            status: 'pending',
            createdAt: Date.now()
        });
        return chatId;
    };

    const acceptConnection = async (chatId) => {
        const chatRef = ref(db, `chats/${chatId}`);
        await set(ref(db, `chats/${chatId}/status`), 'active');
    };

    const sendMessage = async (chatId, senderId, message) => {
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
            senderId,
            text: message,
            timestamp: Date.now()
        });
    };

    const listenToChat = (chatId, callback) => {
        const chatRef = ref(db, `chats/${chatId}`);
        return onValue(chatRef, (snapshot) => callback(snapshot.val()));
    };

    const listenToMessages = (chatId, callback) => {
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        return onValue(messagesRef, (snapshot) => callback(snapshot.val()));
    };

    return {
        createConnection,
        acceptConnection,
        sendMessage,
        listenToChat,
        listenToMessages
    };
}

const chatService = createChatService();
export { auth, db, onAuthStateChange, getUserProfile, updateUserProfile, chatService };
