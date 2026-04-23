
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

    it('renders the post-event Thank You banner', () => {
        renderComponent();
        expect(screen.getByText('感谢大家的参与！')).toBeInTheDocument();
        expect(screen.getByText('EVENT COMPLETE ✓')).toBeInTheDocument();
        expect(screen.getByText('马到成功！🐎')).toBeInTheDocument();
    });

    it('renders the event date and location metadata', () => {
        renderComponent();
        expect(screen.getByText('2026年3月8日 星期日')).toBeInTheDocument();
        expect(screen.getByText('纳迪克高中礼堂')).toBeInTheDocument();
    });

    it('renders archived Program and Food navigation cards', () => {
        renderComponent();
        expect(screen.getByText('节目单')).toBeInTheDocument();
        expect(screen.getByText('Performance Archive')).toBeInTheDocument();
        expect(screen.getByText('新春美食')).toBeInTheDocument();
        expect(screen.getByText('Food & Snacks Archive')).toBeInTheDocument();
    });

    it('renders the Staff Portal link', () => {
        renderComponent();
        expect(screen.getByText('工作人员入口')).toBeInTheDocument();
        expect(screen.getByText('Staff / Admin / Host Portal')).toBeInTheDocument();
    });
});
