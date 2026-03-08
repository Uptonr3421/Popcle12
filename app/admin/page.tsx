'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiresAt: string;
  active: boolean;
}

interface Customer {
  id: string;
  phone: string;
  name: string;
  stampCount: number;
  userType: string;
  createdAt: string;
}

interface Stats {
  totalCustomers: number;
  totalStampsAdded: number;
  rewardsRedeemed: number;
  activeOffers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminPhone, setAdminPhone] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'offers'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // New offer form state
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount: '',
    expiresAt: '',
    geofenceEnabled: false,
    lat: '',
    lng: '',
    radiusMeters: '200',
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminPhone');
    if (savedAdmin) {
      setAdminPhone(savedAdmin);
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = adminPhone.replace(/\D/g, '');
    setLoginError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      if (response.ok) {
        localStorage.setItem('adminPhone', digits);
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError('Invalid admin credentials');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
      console.error('Admin login error:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, customersRes, offersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/customers'),
        fetch('/api/offers'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers);
      }

      if (offersRes.ok) {
        const data = await offersRes.json();
        setOffers(data.offers);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOffer,
          geofence_enabled: newOffer.geofenceEnabled,
          lat: newOffer.geofenceEnabled ? parseFloat(newOffer.lat) : null,
          lng: newOffer.geofenceEnabled ? parseFloat(newOffer.lng) : null,
          radius_meters: newOffer.geofenceEnabled ? parseInt(newOffer.radiusMeters) : 200,
        }),
      });

      if (response.ok) {
        alert('Offer created successfully!');
        setNewOffer({ title: '', description: '', discount: '', expiresAt: '', geofenceEnabled: false, lat: '', lng: '', radiusMeters: '200' });
        await fetchDashboardData();
      } else {
        alert('Failed to create offer');
      }
    } catch (err) {
      alert('Error creating offer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPhone');
    setIsAuthenticated(false);
    setAdminPhone('');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/50 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-display font-bold text-primary animate-neon-pulse mb-2">
              Pop Culture CLE
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Admin Dashboard</p>
          </div>

          <div className="card-vibrant bg-card backdrop-blur-md p-10 shadow-2xl border border-border">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="admin-phone" className="block text-sm font-semibold text-foreground mb-3">
                  Admin Phone Number
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits.length <= 3) setAdminPhone(digits);
                    else if (digits.length <= 6) setAdminPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
                    else setAdminPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`);
                  }}
                  placeholder="(216) 245-7316"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-primary focus:outline-none text-lg bg-input min-h-[44px] transition-colors font-medium"
                  autoFocus
                />
                <p className="text-xs text-foreground/60 mt-2">Enter admin credentials to access dashboard</p>
              </div>

              {loginError && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium text-center bg-red-500/20 text-red-400 border border-red-500/30">
                  {loginError}
                </div>
              )}

              <Button type="submit" className="btn-primary-glow w-full shadow-lg">
                Login →
              </Button>

              <Link href="/" className="block">
                <Button type="button" variant="outline" className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10 font-medium">
                  ← Back Home
                </Button>
              </Link>
            </form>
          </div>

          <div className="mt-8 text-center text-xs text-foreground/60">
            <p className="font-medium">Admin Access Only</p>
            <p>Unauthorized access is prohibited</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/50 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-secondary/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b shadow-sm" style={{ background: 'linear-gradient(to right, #0a0f1e, #0f1628)', borderBottomColor: 'rgba(70,187,255,0.2)' }}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold" style={{ color: '#e8edf5' }}>
                Pop Culture CLE
              </h1>
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(70,187,255,0.15)', color: '#46bbff', border: '1px solid rgba(70,187,255,0.4)', letterSpacing: '2px' }}>
                ADMIN
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium transition-colors px-4 py-2 rounded"
              style={{ color: 'rgba(232,237,245,0.4)' }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-4 mb-8 border-b border-border/50">
            {(['overview', 'customers', 'offers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/70 hover:text-foreground'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'customers' && '👥 Customers'}
                {tab === 'offers' && '🎁 Offers'}
              </button>
            ))}
            <Link href="/admin/deals">
              <button className="px-6 py-3 font-semibold transition-colors border-b-2 border-transparent text-foreground/70 hover:text-foreground">
                🗓️ Deals
              </button>
            </Link>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">Business Analytics</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Customers', value: stats.totalCustomers, icon: '👥' },
                  { label: 'Stamps Added', value: stats.totalStampsAdded, icon: '🎫' },
                  { label: 'Rewards Redeemed', value: stats.rewardsRedeemed, icon: '🎁' },
                  { label: 'Active Offers', value: stats.activeOffers, icon: '🏷️' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#0f1628', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid rgba(70,187,255,0.12)' }}>
                    <div className="text-4xl mb-3">{stat.icon}</div>
                    <p className="text-sm font-medium mb-2" style={{ color: 'rgba(232,237,245,0.45)' }}>{stat.label}</p>
                    <p className="text-4xl font-display font-bold" style={{ color: '#46bbff' }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">Loyal Customers</h2>
              {customers.length > 0 ? (
                <div className="card-vibrant bg-card overflow-x-auto shadow-lg rounded-2xl border border-border">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold text-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-foreground">Phone</th>
                        <th className="text-center p-4 font-semibold text-foreground">Stamps</th>
                        <th className="text-center p-4 font-semibold text-foreground">Type</th>
                        <th className="text-left p-4 font-semibold text-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                          <td className="p-4 font-medium">{customer.name}</td>
                          <td className="p-4 text-foreground/70">{customer.phone}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full font-semibold text-accent">
                              {customer.stampCount}/10
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              customer.userType === 'employee'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-secondary/20 text-secondary'
                            }`}>
                              {customer.userType === 'employee' ? 'Employee' : 'Customer'}
                            </span>
                          </td>
                          <td className="p-4 text-foreground/70 text-sm">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card-vibrant bg-card p-12 text-center border border-border">
                  <p className="text-muted-foreground text-lg">No customers yet</p>
                </div>
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-display font-bold">Manage Offers</h2>

              {/* Create New Offer */}
              <div className="card-vibrant bg-card p-8 shadow-lg border border-border">
                <h3 className="text-xl font-display font-bold mb-6">Create New Offer</h3>
                <form onSubmit={handleCreateOffer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Offer Title</label>
                    <input
                      type="text"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                      placeholder="e.g., Free Topping Tuesday"
                      className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                    <textarea
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                      placeholder="Describe your offer"
                      className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none min-h-24"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Discount/Deal</label>
                      <input
                        type="text"
                        value={newOffer.discount}
                        onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                        placeholder="e.g., 50% Off"
                        className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Expires At</label>
                      <input
                        type="datetime-local"
                        value={newOffer.expiresAt}
                        onChange={(e) => setNewOffer({ ...newOffer, expiresAt: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">Enable Geofencing</label>
                      <input
                        type="checkbox"
                        checked={newOffer.geofenceEnabled}
                        onChange={(e) => setNewOffer({ ...newOffer, geofenceEnabled: e.target.checked })}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                    </div>
                    {newOffer.geofenceEnabled && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">Latitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={newOffer.lat}
                            onChange={(e) => setNewOffer({ ...newOffer, lat: e.target.value })}
                            placeholder="41.4384"
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:outline-none text-sm bg-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">Longitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={newOffer.lng}
                            onChange={(e) => setNewOffer({ ...newOffer, lng: e.target.value })}
                            placeholder="-81.4096"
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:outline-none text-sm bg-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">Radius (m)</label>
                          <input
                            type="number"
                            value={newOffer.radiusMeters}
                            onChange={(e) => setNewOffer({ ...newOffer, radiusMeters: e.target.value })}
                            placeholder="200"
                            className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:outline-none text-sm bg-input"
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">When enabled, customers nearby receive push notifications about this offer.</p>
                  </div>

                  <Button type="submit" disabled={loading} className="btn-primary-glow w-full">
                    {loading ? 'Creating...' : 'Create Offer'}
                  </Button>
                </form>
              </div>

              {/* Active Offers */}
              <div>
                <h3 className="text-xl font-display font-bold mb-4">Active Offers</h3>
                {offers.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {offers.map((offer) => (
                      <div key={offer.id} className="card-vibrant bg-card p-6 shadow-lg border border-border">
                        <h4 className="text-lg font-bold text-primary mb-2">{offer.title}</h4>
                        <p className="text-foreground/80 mb-3">{offer.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-accent">{offer.discount}</span>
                          <span className="text-sm text-muted-foreground">
                            Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card-vibrant bg-card p-12 text-center border border-border">
                    <p className="text-muted-foreground">No active offers yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
