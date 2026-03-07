import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicRegistration from '../PublicRegistration';
import * as dataService from '../../services/dataService';
import { TicketType, CheckInStatus } from '../../types';

// Mock window.scrollTo since JSDOM doesn't implement it
window.scrollTo = jest.fn();

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
    __esModule: true,
    default: {
        toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqrcodedata')
    },
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
            walkInCap: 50,
            publicWalkInEnabled: true
        });
        (dataService.getReservations as jest.Mock).mockResolvedValue([]);
        (dataService.getRecentReservations as jest.Mock).mockResolvedValue([]);
    });

    describe('Layout & Props', () => {
        it('renders Walk-in specific layout when forceWalkIn is true', async () => {
            renderComponent({ forceWalkIn: true });

            expect(await screen.findByText('现场购票录入 (Staff Walk-in Registration)')).toBeInTheDocument();
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

    describe('Form Interactions & Submission', () => {
        beforeEach(() => {
            (dataService.createReservation as jest.Mock).mockResolvedValue({ id: 'test-res-id' });
        });

        it('navigates between steps correctly', async () => {
            renderComponent();

            // Step 1
            expect(await screen.findByText(/选票 Pick Ticket/i)).toBeInTheDocument();

            // Proceed to Step 2
            const continueButton = screen.getByText('确认票种并继续 Continue').closest('button');
            fireEvent.click(continueButton!);

            // Step 2
            expect(await screen.findByText('请填写真实姓名和联系方式')).toBeInTheDocument();

            // Go back
            const allButtons = screen.getAllByRole('button');
            const backButton = allButtons[allButtons.length - 2];
            fireEvent.click(backButton);

            expect(await screen.findByText('确认票种并继续 Continue')).toBeInTheDocument();
        });

        it('handles successful form submission', async () => {
            renderComponent({ forceWalkIn: true });

            const lastNameInput = await screen.findByPlaceholderText('例(e.g.): Zhang');
            fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

            const firstNameInput = screen.getByPlaceholderText('例(e.g.): San');
            fireEvent.change(firstNameInput, { target: { value: 'John' } });

            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            fireEvent.change(phoneInput, { target: { value: '508-123-4567' } });

            const emailInput = screen.getByPlaceholderText('用于接收确认邮件 / For confirmation email');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            const waiverCheckbox = screen.getByRole('checkbox');
            fireEvent.click(waiverCheckbox);

            const submitButtons = screen.getAllByRole('button');
            const submitButton = submitButtons[submitButtons.length - 1]; // "立即提交预约 Submit"

            fireEvent.click(submitButton);

            expect(dataService.createReservation).toHaveBeenCalledWith(expect.objectContaining({
                contactName: 'John Smith',
                phoneNumber: '508-123-4567',
                email: 'test@example.com',
                ticketType: TicketType.WalkIn,
            }));

            // wait for the Red Envelope
            expect(await screen.findByText('点击开启好运 | Tap to Open')).toBeInTheDocument();

            // click to open envelope
            fireEvent.click(screen.getByText('福'));

            // verify TicketSuccess
            expect(await screen.findByText(/注册下一位/)).toBeInTheDocument();
        });

        it('shows error on duplicate phone', async () => {
            (dataService.createReservation as jest.Mock).mockRejectedValue(new Error('DUPLICATE_PHONE'));
            renderComponent({ forceWalkIn: true });

            const lastNameInput = await screen.findByPlaceholderText('例(e.g.): Zhang');
            fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
            const firstNameInput = screen.getByPlaceholderText('例(e.g.): San');
            fireEvent.change(firstNameInput, { target: { value: 'John' } });
            const phoneInput = screen.getByPlaceholderText('508-xxx-xxxx');
            fireEvent.change(phoneInput, { target: { value: '508-123-4567' } });
            const emailInput = screen.getByPlaceholderText('用于接收确认邮件 / For confirmation email');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            const waiverCheckbox = screen.getByRole('checkbox');
            fireEvent.click(waiverCheckbox);

            const submitButtons = screen.getAllByRole('button');
            const submitButton = submitButtons[submitButtons.length - 1];
            fireEvent.click(submitButton);

            expect(await screen.findByText(/该号码已报名/)).toBeInTheDocument();
        });
    });
});
