import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LiveTicker } from '../LiveTicker';
import { getRecentReservations } from '../../../services/dataService';

// Mock Firebase before anything else imports it
jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(), collection: jest.fn(), query: jest.fn(),
    where: jest.fn(), getDocs: jest.fn(), doc: jest.fn(), setDoc: jest.fn(),
    updateDoc: jest.fn(), deleteDoc: jest.fn(), orderBy: jest.fn()
}));
jest.mock('firebase/analytics', () => ({ getAnalytics: jest.fn() }));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(), GoogleAuthProvider: class { }, signInWithPopup: jest.fn(),
    signOut: jest.fn(), onAuthStateChanged: jest.fn()
}));

jest.mock('../../../services/dataService');

describe('LiveTicker Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders nothing if no reservations', async () => {
        (getRecentReservations as jest.Mock).mockResolvedValue([]);
        const { container } = render(<LiveTicker />);

        // allow useEffect to run
        await act(async () => {
            await Promise.resolve();
        });

        expect(container.firstChild).toBeNull();
    });

    it('fetches and displays reservations correctly', async () => {
        const mockReservations = [
            { contactName: 'John Doe', createdTime: Date.now() - 30000 }, // < 1 min
            { contactName: 'Alice B. Cooper', createdTime: Date.now() - 3000000 }, // 50 mins
            { contactName: 'Zheng', createdTime: Date.now() - 4000000 }, // 66 mins
            { contactName: 'Bob Smith', createdTime: Date.now() - 86400000 }, // > 2 hours
        ];
        (getRecentReservations as jest.Mock).mockResolvedValue(mockReservations);

        render(<LiveTicker />);

        // flush promises
        await act(async () => {
            await Promise.resolve();
        });

        // time logic in useEffect runs after initial render
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.getByText('J.D. 刚刚预约 (just reserved)')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5500); // 5s interval + 0.5s fade
        });

        expect(screen.getByText('A.C. 50 分钟前预约 (reserved 50 mins ago)')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5500);
        });

        expect(screen.getByText('Z. 1 小时前预约 (reserved 1 hour ago)')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5500);
        });

        expect(screen.getByText('B.S. 今天已预约 (reserved today)')).toBeInTheDocument();
    });
});
