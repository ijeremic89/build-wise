const ICONS_BY_NAME: Record<string, string> = {
    'Zemljište': '🏞️',
    'Papiri/Priključci': '📋',
    'Iskopi': '🚜',
    'Roh-Bau': '🧱',
    'Stolarija': '🚪',
    'Elektroinstalacije': '⚡',
    'Hidroinstalacije': '🚰',
    'Grijanje/Hlađenje': '🌡️',
    'Unutarnji grubi radovi': '🔨',
    'Unutarnji fini radovi': '🎨',
    'Fasada': '🏠',
    'Namještaj': '🛋️',
    'Okućnica': '🌳',
};

const DEFAULT_ICON = '📦';

export function iconForCategory(name: string): string {
    return ICONS_BY_NAME[name] ?? DEFAULT_ICON;
}
