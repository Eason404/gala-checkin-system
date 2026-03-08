
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBwHlmVRRqgF_M046_ia2yAkm7Iw88vefs",
    authDomain: "gala-checkin-system.firebaseapp.com",
    projectId: "gala-checkin-system",
    storageBucket: "gala-checkin-system.firebasestorage.app",
    messagingSenderId: "433574027826",
    appId: "1:433574027826:web:28b85ad7d3bf130b1d122b",
    measurementId: "G-02D5SPKPJP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function auditRaffle() {
    try {
        const q = query(collection(db, 'reservations'), where('phoneNumber', '==', '8572723058'));
        const snap = await getDocs(q);

        snap.forEach(docSnap => {
            const data = docSnap.data();
            console.log(`--- Record ${data.id} ---`);
            console.log('Created Time:', data.createdTime?.toDate?.()?.toISOString() || data.createdTime);
            console.log('Operator ID:', data.operatorId);
            console.log('Last Modified By:', data.lastModifiedBy);
            console.log('Check-in Status:', data.checkInStatus);
            console.log('Ticket Type:', data.ticketType);
            console.log('Lottery Numbers:', JSON.stringify(data.lotteryNumbers));
            console.log('Edit History:', JSON.stringify(data.editHistory));
        });

    } catch (error) {
        console.error('Audit failed:', error);
    }
    process.exit(0);
}

auditRaffle();
