import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, handleApiError } from '../api';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setData(res.data);
      } catch (err) {
        setError(handleApiError(err).message);
      }
    })();
  }, [id]);

  const del = async () => {
    if (!confirm('Delete this customer?')) return;
    await api.delete(`/customers/${id}`);
    navigate('/customers');
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{data.firstName} {data.lastName}</h2>
        <div className="flex gap-2">
          <Link to={`/customers/${id}/edit`} className="rounded border px-3 py-1">Edit</Link>
          <button onClick={del} className="rounded border px-3 py-1 text-red-600">Delete</button>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700">Phone: {data.phone} {data.email ? `• ${data.email}` : ''}</div>
      <div className="mt-3">Has Only One Address: {data.hasOnlyOneAddress ? 'Yes' : 'No'}</div>

      <h3 className="mt-6 text-lg font-medium">Addresses</h3>
      <ul className="mt-2 divide-y rounded border bg-white">
        {data.addresses.map(a => (
          <li key={a.id} className="p-3">
            <div className="font-medium">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
            <div className="text-sm text-gray-600">{a.city}, {a.state} {a.pincode} • {a.country} {a.isPrimary ? '• Primary' : ''}</div>
          </li>
        ))}
      </ul>
      <Link to={`/addresses?customerId=${id}`} className="mt-4 inline-block rounded border px-3 py-1">Manage Addresses</Link>
    </div>
  );
}


