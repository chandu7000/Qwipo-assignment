import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, handleApiError } from '../api';

export default function AddressManager() {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const customerId = params.get('customerId') || '';
  const city = params.get('city') || '';
  const state = params.get('state') || '';
  const pincode = params.get('pincode') || '';
  const multipleOnly = params.get('multipleOnly') || '';

  const setQuery = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) merged.delete(k); else merged.set(k, String(v));
    });
    setParams(merged);
  };

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const res = await api.get('/addresses', { params: { customerId, city, state, pincode, multipleOnly } });
        setRows(res.data);
      } catch (err) {
        setError(handleApiError(err).message);
      }
    })();
  }, [customerId, city, state, pincode, multipleOnly]);

  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (r) => setEditRow({ ...r });
  const cancel = () => setEditRow(null);
  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/addresses/${editRow.id}`, {
        line1: editRow.line1,
        line2: editRow.line2,
        city: editRow.city,
        state: editRow.state,
        country: editRow.country,
        pincode: editRow.pincode,
        isPrimary: !!editRow.isPrimary,
      });
      setEditRow(null);
      // refresh
      const res = await api.get('/addresses', { params: { customerId, city, state, pincode, multipleOnly } });
      setRows(res.data);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Address Manager</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <input placeholder="Customer ID" className="rounded border p-2" value={customerId} onChange={(e)=>setQuery({ customerId: e.target.value })} />
        <input placeholder="City" className="rounded border p-2" value={city} onChange={(e)=>setQuery({ city: e.target.value })} />
        <input placeholder="State" className="rounded border p-2" value={state} onChange={(e)=>setQuery({ state: e.target.value })} />
        <input placeholder="Pincode" className="rounded border p-2" value={pincode} onChange={(e)=>setQuery({ pincode: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={multipleOnly==='true'} onChange={(e)=>setQuery({ multipleOnly: e.target.checked ? 'true' : '' })} /> Multiple Only</label>
      </div>
      {error && <div className="mt-3 text-red-600">{error}</div>}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y rounded border bg-white">
          <thead>
            <tr className="bg-gray-50 text-left text-sm">
              <th className="p-2">Customer</th>
              <th className="p-2">Address</th>
              <th className="p-2">City/State</th>
              <th className="p-2">Pincode</th>
              <th className="p-2">Primary</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(r => (
              <tr key={r.id} className="text-sm">
                <td className="p-2">{r.customerId} • {r.firstName} {r.lastName}</td>
                <td className="p-2">{editRow?.id===r.id ? (
                  <input className="w-full rounded border p-1" value={editRow.line1} onChange={(e)=>setEditRow(v=>({...v, line1: e.target.value}))} />
                ) : r.line1}
                </td>
                <td className="p-2">{editRow?.id===r.id ? (
                  <div className="flex gap-2">
                    <input className="w-full rounded border p-1" value={editRow.city} onChange={(e)=>setEditRow(v=>({...v, city: e.target.value}))} />
                    <input className="w-full rounded border p-1" value={editRow.state} onChange={(e)=>setEditRow(v=>({...v, state: e.target.value}))} />
                  </div>
                ) : `${r.city}, ${r.state}`}
                </td>
                <td className="p-2">{editRow?.id===r.id ? (
                  <input className="w-full rounded border p-1" value={editRow.pincode} onChange={(e)=>setEditRow(v=>({...v, pincode: e.target.value}))} />
                ) : r.pincode}</td>
                <td className="p-2">{editRow?.id===r.id ? (
                  <input type="checkbox" checked={!!editRow.isPrimary} onChange={(e)=>setEditRow(v=>({...v, isPrimary: e.target.checked}))} />
                ) : (r.isPrimary ? 'Yes' : 'No')}</td>
                <td className="p-2 text-right">
                  {editRow?.id===r.id ? (
                    <div className="flex justify-end gap-2">
                      <button disabled={saving} onClick={save} className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50">Save</button>
                      <button onClick={cancel} className="rounded border px-3 py-1">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>startEdit(r)} className="rounded border px-3 py-1">Edit</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


