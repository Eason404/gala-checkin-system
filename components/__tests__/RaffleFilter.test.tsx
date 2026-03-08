import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RaffleWheel from '../RaffleWheel';
import { getLotteryCandidates, getTicketConfig, subscribeToLotteryState, updateLotteryState } from '../../services/dataService';
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
const mockUpdateLotteryState = updateLotteryState as jest.Mock;
const mockGetCurrentUserRole = getCurrentUserRole as jest.Mock;

describe('RaffleWheel Candidate Filtering', () => {
    let unsubscribeMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        unsubscribeMock = jest.fn();
        mockSubscribeToLotteryState.mockReturnValue(unsubscribeMock);
        mockGetCurrentUserRole.mockReturnValue('admin');
        mockGetTicketConfig.mockResolvedValue({ lotteryEnabled: true });
        mockUpdateLotteryState.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('filters out ALL tickets associated with a winning phone number', async () => {
        // Setup scenarios: 
        // 1. Family A (Yihong) has 2 tickets (two separate reservations but same phone)
        // 2. Family B (Hillary) has 3 tickets (one reservation)
        mockGetLotteryCandidates.mockResolvedValue([
            {
                contactName: 'Yihong',
                phoneNumber: '8572723058',
                checkInStatus: CheckInStatus.Arrived,
                lotteryNumbers: ['447']
            },
            {
                contactName: 'Yihong',
                phoneNumber: '8572723058',
                checkInStatus: CheckInStatus.Arrived,
                lotteryNumbers: ['508']
            },
            {
                contactName: 'Hillary',
                phoneNumber: '7656376969',
                checkInStatus: CheckInStatus.Arrived,
                lotteryNumbers: ['644', '827', '511']
            }
        ]);

        // Yihong has already won with ticket '447'
        let stateCallback: Function;
        mockSubscribeToLotteryState.mockImplementation((cb: Function) => {
            stateCallback = cb;
            cb({
                isSpinning: false,
                pastWinners: [{ number: '447', firstName: 'Yihong', phone: '8572723058' }]
            });
            return unsubscribeMock;
        });

        render(<RaffleWheel />);

        await act(async () => {
            await Promise.resolve();
        });

        // As Admin, the pool sizes are not shown, but we can verify the drawing logic directly
        // The start spin button should be visible
        // Let's verify that starting the spin pulls from the correct pool (only Hillary left).
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const startBtn = screen.getByText(/开始抽奖/);

        await act(async () => {
            await user.click(startBtn);
        });

        // Fast forward 3 seconds for spin resolution
        await act(async () => {
            jest.advanceTimersByTime(3000);
            await Promise.resolve();
        });

        // The updateLotteryState should have been called with a winner that is NOT Yihong
        const updateCallArgs = mockUpdateLotteryState.mock.calls.find(call => call[0].winner);
        expect(updateCallArgs).toBeDefined();
        if (updateCallArgs) {
            expect(updateCallArgs[0].winner.firstName).toBe('Hillary');
            expect(updateCallArgs[0].winner.phone).toBe('7656376969');
        }
    });
});
