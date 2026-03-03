import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepTwoForm } from '../StepTwoForm';
import { TicketType } from '../../../types';
import userEvent from '@testing-library/user-event';

describe('StepTwoForm Component', () => {
    const defaultProps = {
        formData: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            adults: 1,
            children: 0,
            ticketType: TicketType.EarlyBird,
            isPerformer: false,
            performanceUnit: ''
        },
        setFormData: jest.fn(),
        handleSubmit: jest.fn((e) => e.preventDefault()),
        loading: false,
        submitError: '',
        agreedToWaiver: false,
        setAgreedToWaiver: jest.fn(),
        setShowWaiverModal: jest.fn(),
        handlePrevStep: jest.fn(),
        triggerHaptic: jest.fn(),
        currentPrice: 15
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<StepTwoForm {...defaultProps} />);
        expect(screen.getByPlaceholderText('例(e.g.): Zhang')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('例(e.g.): San')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('508-xxx-xxxx')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('用于接收确认邮件 / For confirmation email')).toBeInTheDocument();
        expect(screen.getByText('成人 Adults')).toBeInTheDocument();
        expect(screen.getByText('儿童 Kids')).toBeInTheDocument();
    });

    it('calls setFormData when input fields change', async () => {
        const setFormDataMock = jest.fn();
        render(<StepTwoForm {...defaultProps} setFormData={setFormDataMock} />);

        const lastNameInput = screen.getByPlaceholderText('例(e.g.): Zhang');
        fireEvent.change(lastNameInput, { target: { value: 'Li' } });
        expect(setFormDataMock).toHaveBeenCalled();
    });

    it('adjusts adult and child counts correctly', () => {
        let currentFormData = { ...defaultProps.formData };
        const setFormDataMock = jest.fn((updater) => {
            currentFormData = typeof updater === 'function' ? updater(currentFormData) : updater;
        });
        const { rerender } = render(<StepTwoForm {...defaultProps} formData={currentFormData} setFormData={setFormDataMock} />);

        // Find plus and minus buttons for Adults
        let allPlusButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-plus'));

        // Add Adult
        fireEvent.click(allPlusButtons[0]);
        rerender(<StepTwoForm {...defaultProps} formData={currentFormData} setFormData={setFormDataMock} />);
        expect(setFormDataMock).toHaveBeenCalled();
        expect(currentFormData.adults).toBe(2);

        // Minus Adult
        let allMinusButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-minus'));
        fireEvent.click(allMinusButtons[0]);
        rerender(<StepTwoForm {...defaultProps} formData={currentFormData} setFormData={setFormDataMock} />);
        expect(currentFormData.adults).toBe(1);

        // Add Child
        allPlusButtons = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-plus'));
        fireEvent.click(allPlusButtons[1]);
        rerender(<StepTwoForm {...defaultProps} formData={currentFormData} setFormData={setFormDataMock} />);
        expect(currentFormData.children).toBe(1);
    });

    it('toggles performer status and shows/hides performance unit input', () => {
        const setFormDataMock = jest.fn();
        const { rerender } = render(<StepTwoForm {...defaultProps} setFormData={setFormDataMock} />);

        const yesButton = screen.getByText('是 YES');
        fireEvent.click(yesButton);
        expect(setFormDataMock).toHaveBeenCalled();

        render(<StepTwoForm {...defaultProps} formData={{ ...defaultProps.formData, isPerformer: true }} />);
        expect(screen.getByPlaceholderText('如：中文学校舞蹈组 e.g., Natick Chinese School Dance')).toBeInTheDocument();
    });

    it('handles form submission', () => {
        const handleSubmitMock = jest.fn((e) => e.preventDefault());
        const { container } = render(<StepTwoForm {...defaultProps} handleSubmit={handleSubmitMock} />);

        const form = container.querySelector('form');
        if (form) {
            fireEvent.submit(form);
        }
        expect(handleSubmitMock).toHaveBeenCalled();
    });

    it('shows loading state during submission', () => {
        const { container } = render(<StepTwoForm {...defaultProps} loading={true} />);
        const buttons = screen.getAllByRole('button');
        const submitButton = buttons[buttons.length - 1]; // Submit is the last button
        expect(submitButton).toBeDisabled();
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('handles waiver checkbox click and modal trigger', () => {
        const setAgreedToWaiverMock = jest.fn();
        const setShowWaiverModalMock = jest.fn();
        render(<StepTwoForm {...defaultProps} setAgreedToWaiver={setAgreedToWaiverMock} setShowWaiverModal={setShowWaiverModalMock} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(setAgreedToWaiverMock).toHaveBeenCalled();

        const modalTrigger = screen.getByText(/上述所有条款/);
        fireEvent.click(modalTrigger);
        expect(setShowWaiverModalMock).toHaveBeenCalledWith(true);
    });

    it('shows an error message if submitError exists', () => {
        render(<StepTwoForm {...defaultProps} submitError="Please check your inputs" />);
        expect(screen.getByText('Please check your inputs')).toBeInTheDocument();
    });

    it('handles prev step click', () => {
        const handlePrevStepMock = jest.fn();
        render(<StepTwoForm {...defaultProps} handlePrevStep={handlePrevStepMock} />);
        const allButtons = screen.getAllByRole('button');
        // Prev button is usually the chevron left button, right before submit
        const prevButton = allButtons[allButtons.length - 2];
        fireEvent.click(prevButton);
        expect(handlePrevStepMock).toHaveBeenCalled();
    });
});
