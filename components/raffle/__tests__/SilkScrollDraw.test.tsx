import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { SilkScrollDraw } from '../SilkScrollDraw';

describe('SilkScrollDraw Component', () => {

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const defaultProps = {
        isSpinning: false,
        winner: null,
        currentDisplay: '888',
        isAdmin: false,
    };

    it('renders the scroll structure with header and footer', () => {
        render(<SilkScrollDraw {...defaultProps} />);
        // Royal Decree text
        expect(screen.getByText(/圣旨 · Royal Decree/)).toBeInTheDocument();
    });

    it('uses GPU-friendly scaleY transform instead of height transition', () => {
        render(<SilkScrollDraw {...defaultProps} />);
        const scrollBody = screen.getByTestId('scroll-body');

        // Before unfurl timer fires, scaleY should be 0
        expect(scrollBody.style.transform).toBe('scaleY(0)');
        expect(scrollBody.style.transformOrigin).toBe('top');

        // Verify it transitions only transform and opacity (no height)
        expect(scrollBody.style.transition).toContain('transform');
        expect(scrollBody.style.transition).toContain('opacity');
        expect(scrollBody.style.transition).not.toContain('height');
    });

    it('unfurls after mount delay using scaleY(1)', () => {
        render(<SilkScrollDraw {...defaultProps} />);
        const scrollBody = screen.getByTestId('scroll-body');

        act(() => {
            jest.advanceTimersByTime(150);
        });

        expect(scrollBody.style.transform).toBe('scaleY(1)');
    });

    it('displays the currentDisplay text', () => {
        render(<SilkScrollDraw {...defaultProps} currentDisplay="456" />);
        expect(screen.getByText('456')).toBeInTheDocument();
    });

    it('shows winner name and masked phone when winner is present', () => {
        const winner = { number: '123', firstName: 'Alice', phone: '6175551234' };
        render(<SilkScrollDraw {...defaultProps} winner={winner} currentDisplay="123" />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        // Phone should be masked for non-admin
        expect(screen.getByText('***-***-1234')).toBeInTheDocument();
    });

    it('shows imperial stamp when winner is present and not spinning', () => {
        const winner = { number: '123', firstName: 'Bob', phone: '5551234567' };
        render(<SilkScrollDraw {...defaultProps} winner={winner} currentDisplay="123" />);

        expect(screen.getByText('马到成功')).toBeInTheDocument();
    });

    it('does not show stamp while spinning', () => {
        const winner = { number: '123', firstName: 'Bob', phone: '5551234567' };
        render(<SilkScrollDraw {...defaultProps} isSpinning={true} winner={winner} currentDisplay="123" />);

        expect(screen.queryByText('马到成功')).not.toBeInTheDocument();
    });

    it('applies blur effect to display text during spinning', () => {
        const { container } = render(<SilkScrollDraw {...defaultProps} isSpinning={true} currentDisplay="456" />);
        const displayDiv = container.querySelector('[style*="Ma Shan Zheng"]');
        expect(displayDiv).toBeTruthy();
        expect(displayDiv?.className).toContain('blur-sm');
    });
});
