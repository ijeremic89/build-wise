import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, App as AntApp } from 'antd';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Expenses from './pages/Expenses';
import ExpenseDetail from './pages/ExpenseDetail.tsx';

function usePrefersDark() {
    const [prefersDark, setPrefersDark] = useState(
        () => window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
        mql.addEventListener('change', listener);
        return () => mql.removeEventListener('change', listener);
    }, []);

    return prefersDark;
}

function App() {
    const prefersDark = usePrefersDark();

    return (
        <ConfigProvider
            theme={{
                algorithm: prefersDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#aa3bff',
                },
            }}
        >
            <AntApp>
                <div>
                    <nav>
                        <NavLink to="/" end>
                            Dashboard
                        </NavLink>
                        <NavLink to="/categories">Kategorije</NavLink>
                        <NavLink to="/expenses">Troškovi</NavLink>
                    </nav>

                    <main>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/categories/:id" element={<CategoryDetail />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="/expenses/:id" element={<ExpenseDetail />} />
                        </Routes>
                    </main>
                </div>
            </AntApp>
        </ConfigProvider>
    );
}

export default App;
