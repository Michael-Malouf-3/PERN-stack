import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductPage';
import { Route, Routes } from 'react-router-dom';
import { useThemeStore } from './store/useThemeStore';

function App() {
  const { theme } = useThemeStore();
  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300" data-theme={theme}>
      <NavBar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductsPage />} />
      </Routes>
    </div>
  )
}

export default App
