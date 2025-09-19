import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, handleApiError } from '../api';

const initial = { firstName: '', lastName: '', phone: '', email: '' };

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [values, setValues] = useState(initial);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        const res = await api.get(`/customers/${id}`);
        const { firstName, lastName, phone, email } = res.data;
        setValues({ firstName, lastName, phone, email: email || '' });
      })();
    }
  }, [isEdit, id]);

  const validate = () => {
    if (!values.firstName.trim()) return 'First name is required';
    if (!values.lastName.trim()) return 'Last name is required';
    if (!/^\d{10}$/.test(values.phone)) return 'Phone must be 10 digits';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      if (isEdit) {
        await api.put(`/customers/${id}`, values);
        setSuccess('Customer updated');
      } else {
        await api.post('/customers', values);
        setSuccess('Customer created');
      }
      setTimeout(() => navigate('/customers'), 800);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{isEdit ? 'Edit' : 'New'} Customer</h2>
      <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={submit}>
        <input className="rounded border p-2" placeholder="First Name" value={values.firstName} onChange={(e)=>setValues(v=>({...v, firstName: e.target.value}))} />
        <input className="rounded border p-2" placeholder="Last Name" value={values.lastName} onChange={(e)=>setValues(v=>({...v, lastName: e.target.value}))} />
        <input className="rounded border p-2" placeholder="Phone (10 digits)" value={values.phone} onChange={(e)=>setValues(v=>({...v, phone: e.target.value}))} />
        <input className="rounded border p-2" placeholder="Email (optional)" value={values.email} onChange={(e)=>setValues(v=>({...v, email: e.target.value}))} />
        <div className="sm:col-span-2 mt-2 flex gap-2">
          <button disabled={loading} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50" type="submit">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="rounded border px-3 py-2" onClick={()=>navigate('/customers')}>Cancel</button>
        </div>
      </form>
      {error && <div className="mt-3 text-red-600">{error}</div>}
      {success && <div className="mt-3 text-green-700">{success}</div>}
    </div>
  );
}


