import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, handleApiError } from '../api';

export default function CustomerList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 10);
  const sort = params.get('sort') || 'createdAt';
  const order = params.get('order') || 'desc';
  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const state = params.get('state') || '';
  const pincode = params.get('pincode') || '';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/customers', { params: { page, limit, sort, order, q, city, state, pincode } });
        setData(res.data);
      } catch (err) {
        setError(handleApiError(err).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, sort, order, q, city, state, pincode]);

  const setQuery = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) merged.delete(k); else merged.set(k, String(v));
    });
    setParams(merged);
  };

  const clearFilters = () => setQuery({ q: '', city: '', state: '', pincode: '', page: 1 });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Link to="/customers/new" className="rounded bg-blue-600 px-3 py-2 text-white">New Customer</Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input placeholder="Search name/phone/email" className="rounded border p-2" value={q} onChange={(e)=>setQuery({ q: e.target.value, page:1 })} />
        <input placeholder="City" className="rounded border p-2" value={city} onChange={(e)=>setQuery({ city: e.target.value, page:1 })} />
        <input placeholder="State" className="rounded border p-2" value={state} onChange={(e)=>setQuery({ state: e.target.value, page:1 })} />
        <div className="flex gap-2">
          <input placeholder="Pincode" className="w-full rounded border p-2" value={pincode} onChange={(e)=>setQuery({ pincode: e.target.value, page:1 })} />
          <button className="rounded border px-3" onClick={clearFilters}>Clear</button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <select className="rounded border p-2" value={sort} onChange={(e)=>setQuery({ sort: e.target.value })}>
          <option value="createdAt">Created</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
        </select>
        <select className="rounded border p-2" value={order} onChange={(e)=>setQuery({ order: e.target.value })}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {loading && <div className="mt-6">Loading...</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      <ul className="mt-4 divide-y rounded border bg-white">
        {data.items.map((c) => (
          <li key={c.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.firstName} {c.lastName}</div>
              <div className="text-sm text-gray-600">{c.phone} {c.email ? `• ${c.email}` : ''}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/customers/${c.id}`} className="rounded border px-3 py-1">Profile</Link>
              <Link to={`/customers/${c.id}/edit`} className="rounded border px-3 py-1">Edit</Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {data.total}</div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setQuery({ page: page-1 })} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
          <span>Page {page}</span>
          <button disabled={(page*limit)>=data.total} onClick={()=>setQuery({ page: page+1 })} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}


