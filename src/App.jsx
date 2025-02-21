import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Test from './pages/Test';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from './context/CartContext.jsx';
import useSessionId from './hooks/useSessionId';
import { Toaster } from 'react-hot-toast';
import Cart from './components/Cart.jsx';

function App() {
  const queryClient = new QueryClient();
  const sessionId = useSessionId(); // Generate and persist session ID

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
        <Cart/>
          <Routes>
            <Route path="/" element={<Home sessionId={sessionId} />} />
            <Route path="/test" element={<Test sessionId={sessionId} />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
      <Toaster/>
    </QueryClientProvider>
  );
}

export default App;
