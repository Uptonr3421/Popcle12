'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BroadcastPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminPhone = localStorage.getItem('adminPhone');
    if (!adminPhone) {
      router.replace('/admin');
    }
  }, [router]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Broadcast failed. Please try again.');
      } else {
        setResult(data);
        setTitle('');
        setBody('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Broadcast error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-display font-bold text-primary mb-2">Broadcast Push Notification</h1>
        <p className="text-muted-foreground mb-8">
          Send a push notification to all customers who have the app installed.
        </p>

        <div className="card-vibrant bg-card p-8 shadow-lg border border-border rounded-2xl">
          <form onSubmit={handleBroadcast} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekend Special!"
                maxLength={100}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none bg-input text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g., Come in today and get 20% off all sundaes!"
                maxLength={250}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none bg-input text-foreground resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{body.length}/250 characters</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                {error}
              </div>
            )}

            {result && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                Broadcast sent! {result.sent} delivered{result.failed > 0 ? `, ${result.failed} failed` : ''}.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !title.trim() || !body.trim()}
              className="btn-primary-glow w-full"
            >
              {loading ? 'Sending...' : 'Broadcast to All Customers'}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Only customers who have installed the mobile app and granted notification permission will receive this message.
        </p>
      </div>
    </main>
  );
}
