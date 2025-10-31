'use client';

import { useState, useEffect } from 'react';

interface SupportPointsBalance {
  total: number;
  available: number;
  allocated: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reason?: string;
  created_at: string;
}

interface Allocation {
  id: string;
  target_type: string;
  target_id: string;
  amount: number;
  allocated_at: string;
}

export default function EconomyClient() {
  const [balance, setBalance] = useState<SupportPointsBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load balance
      const balanceResponse = await fetch('/api/support-points/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance);
      }

      // Load transactions
      const txResponse = await fetch('/api/support-points/transactions?limit=10');
      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactions(txData.transactions || []);
      }

      // Load allocations
      const allocResponse = await fetch('/api/support-points/allocations');
      if (allocResponse.ok) {
        const allocData = await allocResponse.json();
        setAllocations(allocData.allocations || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load Support Points data');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading Support Points...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Social Economy</h1>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            Active
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Participate in the cooperative economy through Support Points allocation, timebanking, and mutual aid.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Support Points Balance */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">Support Points</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold">{balance?.available || 0}</p>
            <p className="text-lg opacity-75">/ {balance?.total || 0}</p>
          </div>
          <p className="text-sm opacity-75 mt-2">Available to allocate</p>
          {balance && balance.allocated > 0 && (
            <p className="text-sm opacity-90 mt-1">
              {balance.allocated} allocated to proposals
            </p>
          )}
        </div>

        {/* Timebank (Coming Soon) */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white opacity-60">
          <h3 className="text-sm font-medium opacity-90 mb-1">Timebank Balance</h3>
          <p className="text-5xl font-bold">—</p>
          <p className="text-sm opacity-75 mt-2">Coming soon</p>
        </div>

        {/* Social Horizon (Coming Soon) */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white opacity-60">
          <h3 className="text-sm font-medium opacity-90 mb-1">Social Horizon</h3>
          <p className="text-5xl font-bold">—</p>
          <p className="text-sm opacity-75 mt-2">Coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Allocations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Active Allocations</h2>
          {allocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No active allocations yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Allocate Support Points to proposals you support
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((alloc) => (
                <div key={alloc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alloc.target_type}</p>
                    <p className="text-sm text-gray-500">ID: {alloc.target_id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{alloc.amount} SP</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alloc.allocated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                        ${tx.type === 'earn' || tx.type === 'initial' || tx.type === 'reclaim'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'}
                      `}>
                        {tx.type}
                      </span>
                      <span className={`text-lg font-semibold ${
                        tx.amount > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} SP
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tx.reason || 'Support Points transaction'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Support Points</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Support Points (SP)</strong> are non-transferable points you use to signal which proposals and initiatives matter to you.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Everyone starts with <strong>100 SP</strong></li>
            <li>Allocate up to <strong>10 SP per proposal</strong> (prevents whale behavior)</li>
            <li>Earn more SP by contributing (code, docs, facilitation, mutual aid)</li>
            <li>Reclaim SP when proposals close or get cancelled</li>
            <li>Your allocation history is public (transparency)</li>
          </ul>
          <p className="mt-3">
            <strong>Coming soon:</strong> Timebanking (hour-for-hour exchange) and Social Horizon currency (cooperative value exchange)
          </p>
        </div>
      </div>
    </div>
  );
}
