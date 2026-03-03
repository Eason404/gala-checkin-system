import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepOneTicketSelection } from '../StepOneTicketSelection';
import { TicketType } from '../../../types';

describe('StepOneTicketSelection Component', () => {
    const mockSetFormData = jest.fn();
    const mockTriggerHaptic = jest.fn();
    const mockHandleNextStep = jest.fn();
    const mockProgressBarRef = { current: document.createElement('div') };

    const defaultProps = {
        formData: { ticketType: TicketType.EarlyBird },
        setFormData: mockSetFormData,
        triggerHaptic: mockTriggerHaptic,
        handleNextStep: mockHandleNextStep,
        progressBarRef: mockProgressBarRef,
        earlyBirdProgress: 50,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<StepOneTicketSelection {...defaultProps} />);
        expect(screen.getByText(/新年献礼 · 选择票种/i)).toBeInTheDocument();
        expect(screen.getByText(/早鸟特别票 EARLY BIRD/i)).toBeInTheDocument();
        expect(screen.getByText(/常规票 REGULAR/i)).toBeInTheDocument();
    });

    it('selects EarlyBird ticket correctly', () => {
        render(<StepOneTicketSelection {...defaultProps} formData={{ ticketType: TicketType.Regular }} />);
        const earlyBirdButton = screen.getByText('早鸟特别票 EARLY BIRD').closest('button');
        fireEvent.click(earlyBirdButton!);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.objectContaining({ ticketType: TicketType.EarlyBird }));
        expect(mockTriggerHaptic).toHaveBeenCalledWith(20);
    });

    it('selects Regular ticket correctly', () => {
        render(<StepOneTicketSelection {...defaultProps} />);
        const regularButton = screen.getByText('常规票 REGULAR').closest('button');
        fireEvent.click(regularButton!);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.objectContaining({ ticketType: TicketType.Regular }));
        expect(mockTriggerHaptic).toHaveBeenCalledWith(20);
    });

    it('calls handleNextStep when Continue button is clicked', () => {
        render(<StepOneTicketSelection {...defaultProps} />);
        const continueButton = screen.getByText('确认票种并继续 Continue').closest('button');
        fireEvent.click(continueButton!);

        expect(mockHandleNextStep).toHaveBeenCalled();
    });
});
