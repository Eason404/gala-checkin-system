import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicRegistration from '../PublicRegistration';
import * as dataService from '../../services/dataService';
import { TicketType, CheckInStatus } from '../../types';

// Mock Firebase before anything else imports it
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn()
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    orderBy: jest.fn()
}));
jest.mock('firebase/analytics', () => ({
    getAnalytics: jest.fn()
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    GoogleAuthProvider: class { },
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
}));

// Mock dependencies
jest.mock('../../services/dataService');
jest.mock('qrcode', () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqrcodedata')
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver as any;

const renderComponent = (props = {}, initialEntries = ['/']) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="*" element={<PublicRegistration {...props} />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('PublicRegistration Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (dataService.getTicketConfig as jest.Mock).mockResolvedValue({
            totalHeadcountCap: 450,
            earlyBirdCap: 300,
            regularCap: 50,
            walkInCap: 50
        });
        (dataService.getReservations as jest.Mock).mockResolvedValue([]);
        (dataService.getRecentReservations as jest.Mock).mockResolvedValue([]);
    });

    describe('Layout & Props', () => {
        it('renders Walk-in specific layout when forceWalkIn is true', async () => {
            renderComponent({ forceWalkIn: true });

            expect(await screen.findByText('现场购票录入')).toBeInTheDocument();
            // "取消返回 Close" is only rendered if onClose prop is passed

            // Should skip Step 1 and go straight to Step 2 form
            expect(screen.getByText('请填写真实姓名和联系方式')).toBeInTheDocument(); // A reliable text from StepTwoForm
            expect(screen.queryByText('选票 Pick Ticket')).not.toBeInTheDocument();
        });

        it('handles walkin route via query parameters', async () => {
            renderComponent({}, ['/?type=walkin']);

            // Should act like forceWalkIn
            expect(await screen.findByText('请填写真实姓名和联系方式')).toBeInTheDocument();
            // Wait to ensure it skipped to step 2
            expect(screen.queryByText('1 成人 (12岁以上)')).not.toBeInTheDocument();
        });
    });
});
