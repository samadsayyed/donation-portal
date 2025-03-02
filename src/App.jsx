import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Test from './pages/Test';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from './context/CartContext.jsx';
import useSessionId from './hooks/useSessionId';
import { Toaster } from 'react-hot-toast';
import Cart from './components/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import { useState } from 'react';
import Header from './components/Header.jsx';
import PaymentSuccessPage from './pages/SuccessPage.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const queryClient = new QueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const sessionId = useSessionId();
  const [render,setRender] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
        <Cart isOpen={isOpen} setIsOpen={setIsOpen} render={render} setRender={setRender}/>
        <Header/>
          <Routes>
           
            <Route path="/" element={<Home sessionId={sessionId} isCartOpen={isOpen} setIsCartOpen={setIsOpen} render={render} setRender={setRender} />} />
            <Route path="/checkout" element={<Checkout  />} />
            {/* <Route path="/test" element={<Test sessionId={sessionId} />} /> */}
            <Route path='/success/:data' element={<PaymentSuccessPage/>}/>
          </Routes>
        <Footer/>
        </BrowserRouter>
      </CartProvider>
      <Toaster/>
    </QueryClientProvider>
  );
}

export default App;
