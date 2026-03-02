'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
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

export default function OffersPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [nearStore, setNearStore] = useState(false);
  const [offersLoading, setOffersLoading] = useState(true);
  const [distanceToStore, setDistanceToStore] = useState<number | null>(null);
  const [wasNearStore, setWasNearStore] = useState(false);
  const [claimingOfferId, setClaimingOfferId] = useState<string | null>(null);
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set());
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.phone) {
      checkGeofence();
      fetchOffers();
      
      // Check geofence every 10 seconds
      const interval = setInterval(checkGeofence, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkGeofence = async () => {
    try {
      const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => reject(new Error('Geolocation denied'))
        );
      });

      // Call the geofence API to track and check location
      const action = !wasNearStore ? 'enter' : nearStore ? undefined : 'exit';
      
      const response = await fetch('/api/geofence/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone,
          latitude: position.latitude,
          longitude: position.longitude,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const isNear = data.nearStore;
        
        setDistanceToStore(data.distance);
        
        // Track state changes for enter/exit triggers
        if (isNear && !wasNearStore) {
          setWasNearStore(true);
          
          // Send push notification when entering store area
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('Pop Culture CLE', {
                body: 'You are near our store! Check out our special offers!',
                icon: '/icon.svg',
                badge: '/icon.svg',
                tag: 'geofence-alert',
                requireInteraction: false,
              });
            }).catch(err => console.log('Notification error:', err));
          }
        } else if (!isNear && wasNearStore) {
          setWasNearStore(false);
        }
        
        setNearStore(isNear);
      }
    } catch (err) {
      setNearStore(false);
    }
  };

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const response = await fetch('/api/offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setOffersLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleClaimOffer = async (offerId: string) => {
    if (!user?.phone || !nearStore) return;
    
    setClaimingOfferId(offerId);
    setClaimMessage(null);
    
    try {
      const response = await fetch('/api/offers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: user.phone, 
          offerId,
          action: 'redeem' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaimMessage({ type: 'success', text: data.message || 'Offer claimed successfully!' });
        setClaimedOffers(prev => new Set(prev).add(offerId));
        setTimeout(() => setClaimMessage(null), 5000);
      } else {
        setClaimMessage({ type: 'error', text: data.error || 'Failed to claim offer' });
      }
    } catch (err) {
      setClaimMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setClaimingOfferId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-foreground/70 font-medium">Loading offers...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-orange-50 to-background pb-8">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:opacity-80 transition-opacity">
              Pop Culture CLE
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-1 rounded hover:bg-primary/10"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Title */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-sans font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">Special Offers</span>
            </h1>
            <p className="text-lg text-foreground/70">Exclusive deals for our loyal customers</p>
          </section>

          {/* Geofence Status */}
          {nearStore ? (
            <div className="card-vibrant bg-gradient-to-r from-secondary/20 via-teal-100/30 to-transparent p-6 border-2 border-secondary/50 animate-glow">
              <p className="font-semibold text-secondary text-lg text-center flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">📍</span>
                You're near Pop Culture CLE! All offers are active!
              </p>
              {distanceToStore && (
                <p className="text-sm text-secondary/80 text-center mt-2">
                  {distanceToStore < 100 ? "You're at the store!" : `${distanceToStore}m away`}
                </p>
              )}
            </div>
          ) : (
            <div className="card-vibrant bg-gradient-to-r from-border to-border/50 p-6 border-2 border-border/50 text-center">
              <p className="font-medium text-foreground/70 flex items-center justify-center gap-2">
                <span className="text-xl">📍</span>
                Enable location to see offers near our store
              </p>
              {distanceToStore && (
                <p className="text-sm text-foreground/60 mt-2">
                  You're {(distanceToStore / 1000).toFixed(1)}km from our store
                </p>
              )}
            </div>
          )}

          {/* Claim Message */}
          {claimMessage && (
            <div className={`card-vibrant p-4 text-center animate-bounce-in ${
              claimMessage.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              <p className="font-bold">{claimMessage.text}</p>
            </div>
          )}

          {/* Offers Grid */}
          {offersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">🔄</div>
              <p className="text-foreground/70">Loading offers...</p>
            </div>
          ) : offers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`card-vibrant overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
                    nearStore
                      ? 'bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-secondary/50 animate-glow'
                      : 'bg-white/50 border border-border/50 opacity-75'
                  }`}
                >
                  {/* Offer Header */}
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-secondary/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-sans font-bold text-foreground mb-1">
                          {offer.title}
                        </h3>
                        <div className="text-4xl font-sans font-bold text-accent mb-2">
                          {offer.discount}
                        </div>
                      </div>
                      <div className="text-5xl">🍦</div>
                    </div>
                  </div>

                  {/* Offer Body */}
                  <div className="p-6">
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-6">
                      <span>⏰</span>
                      <span>
                        Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {nearStore ? (
                      claimedOffers.has(offer.id) ? (
                        <div className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg font-semibold text-center text-sm border border-green-300">
                          Claimed!
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleClaimOffer(offer.id)}
                          disabled={claimingOfferId === offer.id}
                          className="w-full btn-secondary-glow shadow-lg disabled:opacity-50"
                        >
                          {claimingOfferId === offer.id ? 'Claiming...' : 'Claim Offer'}
                        </button>
                      )
                    ) : (
                      <div className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-lg font-semibold text-center text-sm">
                        Visit store to redeem
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-vibrant bg-white p-12 text-center">
              <p className="text-2xl text-foreground/70 mb-4">No active offers right now</p>
              <p className="text-foreground/60 mb-8">Check back soon for exciting deals!</p>
              <Link href="/dashboard">
                <Button className="btn-primary-glow">Back to Dashboard</Button>
              </Link>
            </div>
          )}

          {/* Info Section */}
          <section className="card-vibrant bg-gradient-to-br from-primary/10 to-secondary/10 p-8 text-center border border-border/50">
            <h3 className="text-xl font-sans font-bold mb-4">How Offers Work</h3>
            <ol className="space-y-3 text-sm text-foreground/80 text-left max-w-md mx-auto">
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">1.</span>
                <span>Enable location services on your phone</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">2.</span>
                <span>Visit Pop Culture CLE in Solon, OH</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">3.</span>
                <span>Receive notifications for active offers</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">4.</span>
                <span>Claim offers and get discounts!</span>
              </li>
            </ol>
          </section>

          {/* Navigation */}
          <div className="text-center space-y-3">
            <Link href="/dashboard">
              <Button className="btn-primary-glow">Back to Loyalty Dashboard</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
