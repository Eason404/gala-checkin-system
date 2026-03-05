import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import RaffleWheel from '../RaffleWheel';
import { getLotteryCandidates, getTicketConfig, subscribeToLotteryState } from '../../services/dataService';
import { getCurrentUserRole } from '../../services/authService';
import { CheckInStatus } from '../../types';

// Mock Firebase
jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(), collection: jest.fn(), query: jest.fn(),
    where: jest.fn(), getDocs: jest.fn(), doc: jest.fn(), setDoc: jest.fn(),
    updateDoc: jest.fn(), deleteDoc: jest.fn(), orderBy: jest.fn(), onSnapshot: jest.fn(),
}));
jest.mock('firebase/analytics', () => ({ getAnalytics: jest.fn() }));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(), GoogleAuthProvider: class { }, signInWithPopup: jest.fn(),
    signOut: jest.fn(), onAuthStateChanged: jest.fn()
}));

jest.mock('../../services/dataService');
jest.mock('../../services/authService');

const mockGetLotteryCandidates = getLotteryCandidates as jest.Mock;
const mockGetTicketConfig = getTicketConfig as jest.Mock;
const mockSubscribeToLotteryState = subscribeToLotteryState as jest.Mock;
const mockGetCurrentUserRole = getCurrentUserRole as jest.Mock;

describe('RaffleWheel Component', () => {
    let unsubscribeMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        unsubscribeMock = jest.fn();
        mockSubscribeToLotteryState.mockReturnValue(unsubscribeMock);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders loading spinner initially', () => {
        mockGetCurrentUserRole.mockReturnValue('viewer');
        mockGetTicketConfig.mockReturnValue(new Promise(() => { })); // Never resolves
        mockSubscribeToLotteryState.mockImplementation(() => unsubscribeMock);

        render(<RaffleWheel />);
        // Spinner should be visible while loading
        expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('calls getLotteryCandidates instead of getReservations for admin', async () => {
        mockGetCurrentUserRole.mockReturnValue('admin');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: true });
        mockGetLotteryCandidates.mockResolvedValue([
            {
                contactName: 'Alice Wang',
                phoneNumber: '6175551234',
                checkInStatus: CheckInStatus.Arrived,
                lotteryNumbers: ['123'],
            },
        ]);
        mockSubscribeToLotteryState.mockImplementation((cb: Function) => {
            cb({ isSpinning: false, pastWinners: [] });
            return unsubscribeMock;
        });

        render(<RaffleWheel />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockGetLotteryCandidates).toHaveBeenCalledTimes(1);
    });

    it('shows content immediately for non-admin without artificial delay', async () => {
        mockGetCurrentUserRole.mockReturnValue('viewer');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: true });
        mockSubscribeToLotteryState.mockImplementation((cb: Function) => {
            cb({ isSpinning: false, pastWinners: [] });
            return unsubscribeMock;
        });

        render(<RaffleWheel />);

        // Flush the init() promise
        await act(async () => {
            await Promise.resolve();
        });

        // Content should be visible immediately, no artificial 1-2s delay
        await waitFor(() => {
            expect(screen.getByText(/等待主持人开始抽奖/)).toBeInTheDocument();
        });
    });

    it('shows disabled state when lottery is not enabled', async () => {
        mockGetCurrentUserRole.mockReturnValue('viewer');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: false });
        mockSubscribeToLotteryState.mockImplementation(() => unsubscribeMock);

        render(<RaffleWheel />);

        await act(async () => {
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText(/抽奖环节将在演出期间进行/)).toBeInTheDocument();
        });
    });

    it('admin sees the Start Draw button when lottery is enabled', async () => {
        mockGetCurrentUserRole.mockReturnValue('admin');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: true });
        mockGetLotteryCandidates.mockResolvedValue([
            {
                contactName: 'Bob Li',
                phoneNumber: '5089991234',
                checkInStatus: CheckInStatus.Arrived,
                lotteryNumbers: ['456'],
            },
        ]);
        mockSubscribeToLotteryState.mockImplementation((cb: Function) => {
            cb({ isSpinning: false, pastWinners: [] });
            return unsubscribeMock;
        });

        render(<RaffleWheel />);

        await act(async () => {
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText(/开始抽奖/)).toBeInTheDocument();
        });
    });

    it('unsubscribes from lottery state on unmount', async () => {
        mockGetCurrentUserRole.mockReturnValue('viewer');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: true });
        mockSubscribeToLotteryState.mockImplementation(() => unsubscribeMock);

        const { unmount } = render(<RaffleWheel />);

        await act(async () => {
            await Promise.resolve();
        });

        unmount();
        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
