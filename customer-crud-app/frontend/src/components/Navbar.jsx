import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const link = ({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`;
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="font-semibold">Customer CRUD</Link>
        <nav className="flex gap-2 text-sm">
          <NavLink to="/customers" className={link}>Customers</NavLink>
          <NavLink to="/customers/new" className={link}>Create</NavLink>
          <NavLink to="/addresses" className={link}>Addresses</NavLink>
        </nav>
      </div>
    </div>
  );
}


