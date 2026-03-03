import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageReservation from '../ManageReservation';
import * as dataService from '../../services/dataService';
import { CheckInStatus } from '../../types';

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

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <ManageReservation />
        </MemoryRouter>
    );
};

describe('ManageReservation Component', () => {
    const mockReservation = {
        id: 'CNY26-1234',
        contactName: 'Test User',
        phoneNumber: '508-111-2222',
        checkInStatus: CheckInStatus.NotArrived,
        isPerformer: false,
        firebaseDocId: 'test-doc-id'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (dataService.getReservations as jest.Mock).mockResolvedValue([mockReservation]);
    });

    describe('Hardened Lookup Logic', () => {
        it('successfully matches exact full name and exact phone', async () => {
            renderComponent();

            const nameInput = screen.getByPlaceholderText('例如: Zhang San');
            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            const searchButton = screen.getByText('搜索记录 Search');

            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            fireEvent.change(phoneInput, { target: { value: '5081112222' } }); // exact digits
            fireEvent.click(searchButton);

            await waitFor(() => {
                expect(screen.getByText('Test User')).toBeInTheDocument();
                expect(screen.getByText('ID: CNY26-1234')).toBeInTheDocument();
            });
        });

        it('successfully matches exact first name and exact phone', async () => {
            renderComponent();

            const nameInput = screen.getByPlaceholderText('例如: Zhang San');
            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            const searchButton = screen.getByText('搜索记录 Search');

            // Just 'test' should match the first name 'test' from 'test user' case-insensitively
            fireEvent.change(nameInput, { target: { value: 'test' } });
            fireEvent.change(phoneInput, { target: { value: '5081112222' } });
            fireEvent.click(searchButton);

            await waitFor(() => {
                expect(screen.getByText('Test User')).toBeInTheDocument();
            });
        });

        it('fails matching with partial phone number (loose matching protection)', async () => {
            renderComponent();

            const nameInput = screen.getByPlaceholderText('例如: Zhang San');
            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            const searchButton = screen.getByText('搜索记录 Search');

            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            fireEvent.change(phoneInput, { target: { value: '508' } }); // Only 3 digits, should fail
            fireEvent.click(searchButton);

            expect(await screen.findByText('未找到相关预约信息或匹配不正确 (No record found or incorrect info)')).toBeInTheDocument();
        });

        it('fails matching with exact phone but wrong name', async () => {
            renderComponent();

            const nameInput = screen.getByPlaceholderText('例如: Zhang San');
            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            const searchButton = screen.getByText('搜索记录 Search');

            fireEvent.change(nameInput, { target: { value: 'Wrong Name' } });
            fireEvent.change(phoneInput, { target: { value: '5081112222' } });
            fireEvent.click(searchButton);

            expect(await screen.findByText('未找到相关预约信息或匹配不正确 (No record found or incorrect info)')).toBeInTheDocument();
        });
    });
});
