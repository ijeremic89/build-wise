import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';

function App() {
    return (
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
                    <Route path="/expenses" element={<Expenses />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;