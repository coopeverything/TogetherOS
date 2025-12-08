'use client';

import { useState, useEffect } from 'react';
import { SHWalletCard } from '@togetheros/ui/economy';

interface SHWallet {
  memberId: string;
  shBalance: number;
  totalIssued: number;
  totalTransferred: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SHAllocation {
  id: string;
  cycleId: string;
  cycleName: string;
  shAmount: number;
  basis: string;
  createdAt: string;
}

interface SHTransaction {
  id: string;
  amount: number;
  transactionType: string;
  createdAt: string;
}

interface PurchaseEvent {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  rpPerSH: number;
  shCapPerPerson: number;
  globalSHCap: number;
  shDistributed: number;
  status: string;
  userPurchased: number;
  canPurchase: boolean;
}

export default function SocialHorizonClient() {
  const [wallet, setWallet] = useState<SHWallet | null>(null);
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(0);
  const [totalCirculation, setTotalCirculation] = useState<number>(0);
  const [allocations, setAllocations] = useState<SHAllocation[]>([]);
  const [transactions, setTransactions] = useState<SHTransaction[]>([]);
  const [events, setEvents] = useState<PurchaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallet' | 'events' | 'history'>('wallet');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load wallet
      const walletRes = await fetch('/api/social-horizon/wallet');
      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
        setOwnershipPercentage(data.ownershipPercentage || 0);
        setTotalCirculation(data.totalCirculation || 0);
        setAllocations(data.allocations || []);
        setTransactions(data.transactions || []);
      }

      // Load events
      const eventsRes = await fetch('/api/social-horizon/events');
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load data error:', err);
      setLoading(false);
    }
  }

  async function handlePurchase(eventId: string, shAmount: number) {
    try {
      const res = await fetch(`/api/social-horizon/events/${eventId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shAmount }),
      });

      if (res.ok) {
        alert('SH purchase successful!');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Purchase failed');
      }
    } catch (err) {
      alert('Purchase failed');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-success"></div>
          <p className="mt-2 text-ink-400">Loading Social Horizon...</p>
        </div>
      </div>
    );
  }

  const activeEvents = events.filter((e) => e.status === 'active');
  const pastEvents = events.filter((e) => e.status === 'closed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <a href="/economy" className="text-success hover:text-success/80 text-sm mb-2 inline-block">
          &larr; Back to Economy
        </a>
        <h1 className="text-sm font-bold text-ink-900">Social Horizon</h1>
        <p className="text-ink-400 mt-2">
          Your long-term stake in the cooperative. Non-tradable to prevent speculation.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-3">
        <nav className="flex space-x-8">
          {['wallet', 'events', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-success text-success'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {tab === 'wallet' ? 'My Wallet' : tab === 'events' ? 'Purchase Events' : 'History'}
            </button>
          ))}
        </nav>
      </div>

      {/* Wallet Tab */}
      {activeTab === 'wallet' && wallet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SHWalletCard
            wallet={wallet}
            ownershipPercentage={ownershipPercentage}
            totalCirculation={totalCirculation}
          />

          {/* Recent Allocations */}
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Recent Allocations</h2>
            {allocations.length === 0 ? (
              <p className="text-ink-400 text-center py-4">
                No allocations yet. SH is issued quarterly based on contributions.
              </p>
            ) : (
              <div className="space-y-3">
                {allocations.slice(0, 5).map((alloc) => (
                  <div key={alloc.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-ink-900">{alloc.cycleName}</p>
                      <p className="text-xs text-ink-400 capitalize">{alloc.basis.replace('_', ' ')}</p>
                    </div>
                    <span className="text-sm font-semibold text-success">+{alloc.shAmount.toFixed(4)} SH</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-2">
          {/* Active Events */}
          <div>
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Active Purchase Events</h2>
            {activeEvents.length === 0 ? (
              <div className="bg-bg-2 rounded-lg p-4 text-center">
                <p className="text-ink-400">No active purchase events. Check back later!</p>
                <p className="text-sm text-ink-400 mt-2">
                  SH purchase events are rare and capped to prevent wealth concentration.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEvents.map((event) => (
                  <div key={event.id} className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-semibold text-ink-900">{event.eventName}</h3>
                      <span className="px-2 py-1 bg-success-bg text-success text-xs font-medium rounded">Active</span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-ink-400">Price</span>
                        <span className="font-medium text-ink-900">{event.rpPerSH} RP per SH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">Your limit</span>
                        <span className="font-medium text-ink-900">{event.shCapPerPerson} SH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">Purchased</span>
                        <span className="font-medium text-success">{event.userPurchased} SH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400">Global remaining</span>
                        <span className="font-medium text-ink-900">
                          {(event.globalSHCap - event.shDistributed).toFixed(2)} SH
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-ink-400 mb-4">
                      Ends: {new Date(event.endDate).toLocaleDateString()}
                    </div>

                    {event.canPurchase ? (
                      <button
                        onClick={() => {
                          const amount = prompt(`Enter SH amount to purchase (max ${event.shCapPerPerson - event.userPurchased}):`);
                          if (amount) handlePurchase(event.id, parseFloat(amount));
                        }}
                        className="w-full py-2 px-4 bg-success hover:bg-success/90 text-bg-1 font-medium rounded-lg transition-colors"
                      >
                        Purchase SH
                      </button>
                    ) : (
                      <button disabled className="w-full py-2 px-4 bg-bg-2 text-ink-400 font-medium rounded-lg cursor-not-allowed">
                        {event.userPurchased >= event.shCapPerPerson ? 'Limit Reached' : 'Cannot Purchase'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-ink-900 mb-4">Past Events</h2>
              <div className="space-y-2">
                {pastEvents.map((event) => (
                  <div key={event.id} className="bg-bg-2 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-ink-900">{event.eventName}</p>
                      <p className="text-sm text-ink-400">
                        {event.shDistributed.toFixed(2)} / {event.globalSHCap} SH distributed
                      </p>
                    </div>
                    <span className="text-success font-medium">+{event.userPurchased} SH</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-ink-400 text-center py-4">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-ink-900 capitalize">
                      {tx.transactionType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-ink-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(4)} SH
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
