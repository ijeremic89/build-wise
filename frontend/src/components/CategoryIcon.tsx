const ICON_BY_NAME: Record<string, string> = {
    'Zemljište': 'zemljiste',
    'Papiri/Priključci': 'papiri',
    'Iskopi': 'iskopi',
    'Roh-Bau': 'rohbau',
    'Stolarija': 'stolarija',
    'Elektroinstalacije': 'elektro',
    'Hidroinstalacije': 'hidro',
    'Grijanje/Hlađenje': 'grijanje',
    'Unutarnji grubi radovi': 'grubi',
    'Unutarnji fini radovi': 'fini',
    'Fasada': 'fasada',
    'Namještaj': 'namjestaj',
    'Okućnica': 'okucnica',
};

export function iconIdForCategory(name: string): string {
    return ICON_BY_NAME[name] ?? 'default';
}

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
    return (
        <svg className={className} width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <use href={`#icon-${iconIdForCategory(name)}`} />
        </svg>
    );
}

export function CategoryIconSprite() {
    return (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
                <symbol id="icon-zemljiste" viewBox="0 0 24 24">
                    <rect x="5" y="8" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 8V6M19 8V6M5 18v2M19 18v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-papiri" viewBox="0 0 24 24">
                    <path d="M12 6.5c-1.6-1-4-1.5-6-1v13c2-.5 4.4 0 6 1 1.6-1 4-1.5 6-1v-13c-2-.5-4.4 0-6 1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 6.5v13" stroke="currentColor" strokeWidth="1.5" />
                </symbol>
                <symbol id="icon-iskopi" viewBox="0 0 24 24">
                    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9.3 3.6a2.7 2.7 0 0 1 5.4 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 13h8l-1.6 5.2a2.4 2.4 0 0 1-4.8 0z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M3 19.5h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-rohbau" viewBox="0 0 24 24">
                    <path d="M4 20V10L12 4l8 6v10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M4 20h16M9 20v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </symbol>
                <symbol id="icon-stolarija" viewBox="0 0 24 24">
                    <rect x="5" y="5" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                </symbol>
                <symbol id="icon-elektro" viewBox="0 0 24 24">
                    <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9.5 18.5h5M10 21h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-hidro" viewBox="0 0 24 24">
                    <path d="M12 3.5c-3.2 4-5.5 7.3-5.5 10.3a5.5 5.5 0 0 0 11 0c0-3-2.3-6.3-5.5-10.3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </symbol>
                <symbol id="icon-grijanje" viewBox="0 0 24 24">
                    <path d="M12 21c-3 0-5.5-2.3-5.5-5.4 0-2.5 1.4-4 2.3-6.1.6 1.7 1.4 2.4 1.9 2.2-.4-2.6.2-4.9 2-6.7 1 2.7-.4 4.3.6 6.2.5-.5.8-1.2.9-2C15.4 10.5 16 12 16 13.6 16 16.7 13.5 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-grubi" viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 10V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </symbol>
                <symbol id="icon-fini" viewBox="0 0 24 24">
                    <rect x="4" y="5" width="11" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15 7.5h2a2 2 0 0 1 2 2V13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M19 13v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-fasada" viewBox="0 0 24 24">
                    <path d="M4 20V11L12 4l8 7v9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <rect x="10" y="14" width="4" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="6.5" y="13" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </symbol>
                <symbol id="icon-namjestaj" viewBox="0 0 24 24">
                    <rect x="5" y="3" width="14" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="10" cy="12" r="0.9" fill="currentColor" />
                    <circle cx="14" cy="12" r="0.9" fill="currentColor" />
                </symbol>
                <symbol id="icon-okucnica" viewBox="0 0 24 24">
                    <circle cx="12" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 14.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
                <symbol id="icon-default" viewBox="0 0 24 24">
                    <rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </symbol>
                <symbol id="icon-contractor" viewBox="0 0 24 24">
                    <path d="M4 15a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 15h18v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 7V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </symbol>
            </defs>
        </svg>
    );
}
