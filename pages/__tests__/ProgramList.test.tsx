import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramList from '../ProgramList';

describe('ProgramList Component', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <ProgramList />
            </MemoryRouter>
        );
    };

    it('renders the header correctly in both languages', () => {
        renderComponent();
        expect(screen.getByText('节目单')).toBeInTheDocument();
        expect(screen.getByText('Program')).toBeInTheDocument();
    });

    it('renders the time and location banner', () => {
        renderComponent();
        expect(screen.getByText(/1:00 PM – 2:30 PM/)).toBeInTheDocument();
        expect(screen.getByText(/NHS Auditorium/)).toBeInTheDocument();
    });

    it('renders performance items with bilingual content', () => {
        renderComponent();
        // Check for the first performance
        expect(screen.getByText('我和我的祖国')).toBeInTheDocument();
        expect(screen.getByText('My Motherland and Me')).toBeInTheDocument();
        expect(screen.getByText('Natick中老年华人居民')).toBeInTheDocument();
        expect(screen.getByText('Natick Residents')).toBeInTheDocument();

        // Check for a specific type badge using case-insensitive regex with anchors to avoid matching artist names
        expect(screen.getByText('京剧')).toBeInTheDocument();
        expect(screen.getByText(/^Beijing Opera$/i)).toBeInTheDocument();
    });

    it('renders the expected number of performances', () => {
        renderComponent();
        // There are 15 performances; numbers appear on both front and back of each card
        expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1);
    });
});
