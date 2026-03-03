import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TimelineSection } from '../TimelineSection';

describe('TimelineSection Component', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <TimelineSection />
            </MemoryRouter>
        );
    };

    it('renders the agenda header', () => {
        renderComponent();
        expect(screen.getByText('流程安排')).toBeInTheDocument();
        expect(screen.getByText('AGENDA')).toBeInTheDocument();
    });

    it('renders all schedule items', () => {
        renderComponent();
        expect(screen.getByText('春节庙会')).toBeInTheDocument();
        expect(screen.getByText('春节午餐')).toBeInTheDocument();
        expect(screen.getByText('春节联欢晚会')).toBeInTheDocument();
    });

    it('renders the "View Program" link for the Gala Performance', () => {
        renderComponent();
        const link = screen.getByRole('link', { name: /查看节目单 \(View Program\)/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/program');
    });

    it('does not render "View Program" link for other items', () => {
        renderComponent();
        // The link should only be for the Gala Performance (3rd item)
        const links = screen.queryAllByRole('link', { name: /查看节目单 \(View Program\)/i });
        expect(links).toHaveLength(1);
    });
});
