'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount_label: string;
  starts_at: string;
  expires_at: string;
  active: boolean;
  status: 'live' | 'scheduled' | 'expired' | 'inactive';
  geofence_enabled: boolean;
}

interface ScheduledPush {
  id: string;
  title: string;
  body: string;
  scheduled_for: string;
  sent: boolean;
  sent_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  live:      '#39ff14',
  scheduled: '#ffcc33',
  expired:   'rgba(232,237,245,0.3)',
  inactive:  'rgba(232,237,245,0.3)',
};

export default function AdminDeals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pushes, setPushes] = useState<ScheduledPush[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deals' | 'schedule'>('deals');

  // Deal form
  const [form, setForm] = useState({
    title: '', description: '', discountType: 'percentage',
    discountValue: '', discountLabel: '',
    startsAt: '', expiresAt: '',
    geofenceEnabled: false, lat: '', lng: '', radiusMeters: '200',
    schedulePush: false, pushScheduledFor: '', pushTitle: '', pushBody: '',
  });

  // Push form
  const [pushForm, setPushForm] = useState({
    title: '', body: '', scheduledFor: '', recipientType: 'all',
  });

  useEffect(() => {
    const admin = localStorage.getItem('adminPhone');
    if (!admin) { router.push('/admin'); return; }
    fetchDeals();
    fetchPushes();
  }, []);

  const fetchDeals = async () => {
    const res = await fetch('/api/admin/deals');
    if (res.ok) { const d = await res.json(); setDeals(d.deals || []); }
  };

  const fetchPushes = async () => {
    const res = await fetch('/api/admin/scheduled-pushes');
    if (res.ok) { const d = await res.json(); setPushes(d.pushes || []); }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discountValue: Number(form.discountValue),
        radiusMeters: Number(form.radiusMeters),
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
      }),
    });
    if (res.ok) {
      setForm({ title: '', description: '', discountType: 'percentage', discountValue: '', discountLabel: '', startsAt: '', expiresAt: '', geofenceEnabled: false, lat: '', lng: '', radiusMeters: '200', schedulePush: false, pushScheduledFor: '', pushTitle: '', pushBody: '' });
      await fetchDeals();
      await fetchPushes();
    }
    setLoading(false);
  };

  const handleToggleDeal = async (id: string, active: boolean) => {
    await fetch('/api/admin/deals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    });
    await fetchDeals();
  };

  const handleSchedulePush = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/scheduled-pushes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushForm),
    });
    if (res.ok) {
      setPushForm({ title: '', body: '', scheduledFor: '', recipientType: 'all' });
      await fetchPushes();
    }
    setLoading(false);
  };

  const handleDeletePush = async (id: string) => {
    await fetch('/api/admin/scheduled-pushes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchPushes();
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleString() : '—';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(70,187,255,0.05)', border: '1px solid rgba(70,187,255,0.2)',
    color: '#e8edf5', fontSize: 14, outline: 'none',
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'rgba(232,237,245,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1e', color: '#e8edf5' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(to right,#0a0f1e,#0f1628)', borderBottom: '1px solid rgba(70,187,255,0.2)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" style={{ color: 'rgba(232,237,245,0.4)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>← Dashboard</Link>
          <span style={{ color: 'rgba(232,237,245,0.2)' }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#e8edf5' }}>Deal Scheduler</span>
          <span style={{ background: 'rgba(70,187,255,0.15)', border: '1px solid rgba(70,187,255,0.4)', color: '#46bbff', fontSize: 10, fontWeight: 800, letterSpacing: 2, padding: '3px 8px', borderRadius: 6 }}>ADMIN</span>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(70,187,255,0.05)', borderRadius: 12, padding: 4, border: '1px solid rgba(70,187,255,0.1)' }}>
          {(['deals', 'schedule'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'rgba(70,187,255,0.15)' : 'transparent',
                color: activeTab === tab ? '#46bbff' : 'rgba(232,237,245,0.4)',
                fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              }}
            >
              {tab === 'deals' ? '🏷️ Deals' : '📣 Push Notifications'}
            </button>
          ))}
        </div>

        {activeTab === 'deals' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Create Deal Form */}
            <div style={{ background: '#0f1628', borderRadius: 20, padding: 24, border: '1px solid rgba(70,187,255,0.12)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 20 }}>Schedule a Deal</h2>
              <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Deal Title</label><input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Tuesday Scoop Deal" required /></div>
                <div><label style={labelStyle}>Description</label><textarea style={{...inputStyle, minHeight: 80, resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What's the deal?" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Discount Type</label>
                    <select style={inputStyle} value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed $ Off</option>
                      <option value="free_item">Free Item</option>
                    </select>
                  </div>
                  {form.discountType !== 'free_item' && (
                    <div><label style={labelStyle}>{form.discountType === 'percentage' ? 'Percent (%)' : 'Amount ($)'}</label><input style={inputStyle} type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} placeholder="20" /></div>
                  )}
                </div>
                <div><label style={labelStyle}>Display Label (shown to staff)</label><input style={inputStyle} value={form.discountLabel} onChange={e => setForm({...form, discountLabel: e.target.value})} placeholder="20% OFF, FREE SCOOP, etc." required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Starts At</label><input style={inputStyle} type="datetime-local" value={form.startsAt} onChange={e => setForm({...form, startsAt: e.target.value})} /></div>
                  <div><label style={labelStyle}>Expires At</label><input style={inputStyle} type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} required /></div>
                </div>

                {/* Geofence */}
                <div style={{ background: 'rgba(70,187,255,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(70,187,255,0.1)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.geofenceEnabled} onChange={e => setForm({...form, geofenceEnabled: e.target.checked})} style={{ width: 16, height: 16, accentColor: '#46bbff' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#46bbff' }}>Enable Geofencing</span>
                  </label>
                  {form.geofenceEnabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                      <div><label style={labelStyle}>Latitude</label><input style={inputStyle} type="number" step="0.0001" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} placeholder="41.4384" /></div>
                      <div><label style={labelStyle}>Longitude</label><input style={inputStyle} type="number" step="0.0001" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} placeholder="-81.4096" /></div>
                      <div><label style={labelStyle}>Radius (m)</label><input style={inputStyle} type="number" value={form.radiusMeters} onChange={e => setForm({...form, radiusMeters: e.target.value})} /></div>
                    </div>
                  )}
                </div>

                {/* Schedule Push */}
                <div style={{ background: 'rgba(255,204,51,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,204,51,0.1)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.schedulePush} onChange={e => setForm({...form, schedulePush: e.target.checked})} style={{ width: 16, height: 16, accentColor: '#ffcc33' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ffcc33' }}>Schedule a Push Notification</span>
                  </label>
                  {form.schedulePush && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      <div><label style={labelStyle}>Send At</label><input style={inputStyle} type="datetime-local" value={form.pushScheduledFor} onChange={e => setForm({...form, pushScheduledFor: e.target.value})} /></div>
                      <div><label style={labelStyle}>Push Title</label><input style={inputStyle} value={form.pushTitle} onChange={e => setForm({...form, pushTitle: e.target.value})} placeholder="🍦 Deal Alert!" /></div>
                      <div><label style={labelStyle}>Push Message</label><input style={inputStyle} value={form.pushBody} onChange={e => setForm({...form, pushBody: e.target.value})} placeholder="20% off all scoops today only!" /></div>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#46bbff,#39ff14)', color: '#0a0f1e', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.5 }}>
                  {loading ? 'Scheduling...' : '+ Schedule Deal'}
                </button>
              </form>
            </div>

            {/* Deal List */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 20 }}>All Deals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deals.length === 0 && <p style={{ color: 'rgba(232,237,245,0.35)', fontSize: 14 }}>No deals yet</p>}
                {deals.map(deal => (
                  <div key={deal.id} style={{ background: '#0f1628', borderRadius: 16, padding: 16, border: '1px solid rgba(70,187,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5' }}>{deal.title}</span>
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: STATUS_COLORS[deal.status], background: `${STATUS_COLORS[deal.status]}18`, padding: '2px 8px', borderRadius: 6, letterSpacing: 1 }}>
                          {deal.status.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#46bbff' }}>{deal.discount_label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.35)', marginBottom: 10 }}>
                      {fmtDate(deal.starts_at)} → {fmtDate(deal.expires_at)}
                    </div>
                    <button onClick={() => handleToggleDeal(deal.id, deal.active)} style={{ fontSize: 12, fontWeight: 600, background: deal.active ? 'rgba(255,59,141,0.15)' : 'rgba(57,255,20,0.15)', color: deal.active ? '#ff3b8d' : '#39ff14', border: `1px solid ${deal.active ? 'rgba(255,59,141,0.3)' : 'rgba(57,255,20,0.3)'}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>
                      {deal.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Schedule Push Form */}
            <div style={{ background: '#0f1628', borderRadius: 20, padding: 24, border: '1px solid rgba(70,187,255,0.12)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 20 }}>Schedule Push Notification</h2>
              <form onSubmit={handleSchedulePush} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Title</label><input style={inputStyle} value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} placeholder="🍦 Special Announcement" required /></div>
                <div><label style={labelStyle}>Message</label><textarea style={{...inputStyle, minHeight: 80}} value={pushForm.body} onChange={e => setPushForm({...pushForm, body: e.target.value})} placeholder="Come in today for a special deal!" /></div>
                <div><label style={labelStyle}>Send At</label><input style={inputStyle} type="datetime-local" value={pushForm.scheduledFor} onChange={e => setPushForm({...pushForm, scheduledFor: e.target.value})} required /></div>
                <div>
                  <label style={labelStyle}>Recipients</label>
                  <select style={inputStyle} value={pushForm.recipientType} onChange={e => setPushForm({...pushForm, recipientType: e.target.value})}>
                    <option value="all">All Customers</option>
                    <option value="nearby">Nearby Only (geofenced)</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#ffcc33,#ff7b32)', color: '#1f1715', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  {loading ? 'Scheduling...' : '📣 Schedule Push'}
                </button>
              </form>
            </div>

            {/* Push Queue */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e8edf5', marginBottom: 20 }}>Push Queue</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pushes.length === 0 && <p style={{ color: 'rgba(232,237,245,0.35)', fontSize: 14 }}>No scheduled pushes</p>}
                {pushes.map(p => (
                  <div key={p.id} style={{ background: '#0f1628', borderRadius: 16, padding: 16, border: '1px solid rgba(70,187,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: p.sent ? 'rgba(232,237,245,0.4)' : '#e8edf5' }}>{p.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: p.sent ? '#39ff14' : '#ffcc33', background: p.sent ? 'rgba(57,255,20,0.1)' : 'rgba(255,204,51,0.1)', padding: '2px 8px', borderRadius: 6 }}>{p.sent ? 'SENT' : 'PENDING'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(232,237,245,0.45)', marginBottom: 8 }}>{p.body}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'rgba(232,237,245,0.3)' }}>{p.sent ? `Sent: ${fmtDate(p.sent_at || '')}` : `Scheduled: ${fmtDate(p.scheduled_for)}`}</span>
                      {!p.sent && (
                        <button onClick={() => handleDeletePush(p.id)} style={{ fontSize: 11, fontWeight: 600, background: 'rgba(255,59,141,0.1)', color: '#ff3b8d', border: '1px solid rgba(255,59,141,0.2)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
