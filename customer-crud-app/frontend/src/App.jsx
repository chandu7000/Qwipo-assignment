import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import CustomerProfile from './pages/CustomerProfile';
import AddressManager from './pages/AddressManager';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="mx-auto max-w-6xl p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerProfile />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/addresses" element={<AddressManager />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
