import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsappButton from './components/WhatsappButton'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './pages/NotFound'
import ForgotPassword from './components/ForgetPassword'
import UpdatePassword from './pages/UpdatePassword'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={
             <PrivateRoute > <Products /> </PrivateRoute>
           } />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={ 
             <PrivateRoute> <Cart /> </PrivateRoute>   
           } />

          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/update-password/:token" element={<UpdatePassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={
            <PrivateRoute>  <Profile /> </PrivateRoute>
           } />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  )
}
