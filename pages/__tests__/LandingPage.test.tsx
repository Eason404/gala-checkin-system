
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

describe('LandingPage Component', () => {
    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>
        );
    };

    it('renders the hero section with image', () => {
        renderComponent();
        const heroImg = screen.getByAltText('2026 Natick Lunar New Year');
        expect(heroImg).toBeInTheDocument();
        expect(heroImg).toHaveAttribute('src', '/landing-hero.png');
    });

    it('renders navigation cards for Schedule, Program, and Food', () => {
        renderComponent();
        expect(screen.getByText('流程安排')).toBeInTheDocument();
        expect(screen.getByText('Schedule')).toBeInTheDocument();
        expect(screen.getByText('节目单')).toBeInTheDocument();
        expect(screen.getByText('Performances')).toBeInTheDocument();
        expect(screen.getByText('新春美食')).toBeInTheDocument();
        expect(screen.getByText('Food & Snacks')).toBeInTheDocument();
    });

    it('renders the Sold Out state for registration', () => {
        renderComponent();
        expect(screen.getByText('WALK-INS WELCOME')).toBeInTheDocument();
        expect(screen.getByText('现场购票')).toBeInTheDocument();
        expect(screen.getByText('Early Bird Sold Out')).toBeInTheDocument();
    });

    it('renders the Manage Reservation link', () => {
        renderComponent();
        expect(screen.getByText('查询 / 取消预约 My Reservation')).toBeInTheDocument();
    });

    it('renders the Staff, Observer and Admin Portal links', () => {
        renderComponent();
        expect(screen.getByText('内部管理')).toBeInTheDocument();
        expect(screen.getByText('工作人员')).toBeInTheDocument();
        expect(screen.getByText('观察员')).toBeInTheDocument();
        expect(screen.getByText('系统管理')).toBeInTheDocument();
    });
});
