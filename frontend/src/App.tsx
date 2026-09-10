import { useState } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import SubcategoryDetail from './pages/SubcategoryDetail';
import Expenses from './pages/Expenses';
import ExpenseDetail from './pages/ExpenseDetail.tsx';
import Contractors from './pages/Contractors';
import ContractorDetail from './pages/ContractorDetail';
import Todos from './pages/Todos';
import TodoDetail from './pages/TodoDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { CategoryIconSprite } from './components/CategoryIcon';
import { AuthProvider, useAuth } from './components/AuthContext';

const NACRT_THEME = {
    token: {
        colorPrimary: '#2b4c7e',
        colorLink: '#2b4c7e',
        colorLinkHover: '#1f3a63',
        colorSuccess: '#3f7a5c',
        colorError: '#b6482f',
        colorText: '#14181f',
        colorTextSecondary: '#5b6472',
        colorTextTertiary: '#8a919c',
        colorBorder: '#dfe3e8',
        colorBorderSecondary: '#eef0f2',
        colorBgContainer: '#ffffff',
        colorBgLayout: '#ffffff',
        borderRadius: 2,
        borderRadiusLG: 3,
        borderRadiusSM: 2,
        fontFamily: "'IBM Plex Sans', system-ui, 'Segoe UI', Roboto, sans-serif",
        fontSize: 14,
        wireframe: false,
    },
    components: {
        Button: {
            fontWeight: 600,
            primaryShadow: 'none',
            defaultShadow: 'none',
        },
        Card: {
            boxShadowTertiary: 'none',
        },
        Modal: {
            borderRadiusLG: 3,
        },
    },
};

const NAV_ITEMS = [
    { to: '/categories', label: 'Kategorije' },
    { to: '/expenses', label: 'Troškovi' },
    { to: '/contractors', label: 'Izvođači' },
    { to: '/todos', label: 'Zadaci' },
];

function AppContent() {
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    if (isLoading) {
        return <Spin style={{ display: 'block', margin: '80px auto' }} />;
    }

    if (!user) {
        return (
            <main>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <header className="topbar">
                <Link to="/" className="brand">
                    <svg className="brand-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                        <use href="#icon-rohbau" />
                    </svg>
                    BUILDWISE
                </Link>
                <nav>
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.to} to={item.to}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{user.email}</span>
                    <button type="button" className="nc-btn nc-btn-icon" onClick={handleLogout}>
                        Odjava
                    </button>
                </div>
                <button
                    type="button"
                    className="menu-toggle"
                    aria-label={menuOpen ? 'Zatvori izbornik' : 'Otvori izbornik'}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={menuOpen ? '#icon-close' : '#icon-menu'} />
                    </svg>
                </button>
            </header>

            <nav className={`mobile-nav${menuOpen ? ' is-open' : ''}`}>
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                        {item.label}
                    </NavLink>
                ))}
                <button
                    type="button"
                    onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                    }}
                >
                    Odjava
                </button>
            </nav>

            <main>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/categories/:id" element={<CategoryDetail />} />
                    <Route path="/categories/:categoryId/subcategories/:subcategoryId" element={<SubcategoryDetail />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/expenses/:id" element={<ExpenseDetail />} />
                    <Route path="/contractors" element={<Contractors />} />
                    <Route path="/contractors/:id" element={<ContractorDetail />} />
                    <Route path="/todos" element={<Todos />} />
                    <Route path="/todos/:id" element={<TodoDetail />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <ConfigProvider theme={NACRT_THEME}>
            <AntApp>
                <CategoryIconSprite />
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </AntApp>
        </ConfigProvider>
    );
}

export default App;
