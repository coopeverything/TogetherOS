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

  // Sample data for demonstration (will be replaced with real API calls)
  const sampleRewardPoints = { earned: 450, available: 250, spentTBC: 100, spentSH: 100 };
  const sampleTimebank = { balance: 3.5, earned: 8, spent: 4.5 };
  const sampleSocialHorizon = { balance: 12, issued: 10, purchased: 2 };

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
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading Support Points...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">4-Ledger Economic System</h1>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            Active
          </span>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-3xl">
          A comprehensive cooperative economy with four interlinked ledgers: Support Points (governance), Reward Points (economic claims), Timebank Credits (mutual aid), and Social Horizon (cooperative currency).
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Support Points Balance */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Support Points</h3>
            <span className="text-xs bg-white dark:bg-gray-800 bg-opacity-20 px-2 py-1 rounded">SP</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold">{balance?.available || 0}</p>
            <p className="text-lg opacity-75">/ {balance?.total || 0}</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Available to allocate</p>
          {balance && balance.allocated > 0 && (
            <p className="text-xs opacity-90 mt-1">
              {balance.allocated} allocated to proposals
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Governance power • Non-convertible</p>
          </div>
        </div>

        {/* Reward Points */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Reward Points</h3>
            <span className="text-xs bg-white dark:bg-gray-800 bg-opacity-20 px-2 py-1 rounded">RP</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold">{sampleRewardPoints.available}</p>
            <p className="text-lg opacity-75">/ {sampleRewardPoints.earned}</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Available to convert or spend</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {sampleRewardPoints.spentTBC} RP → TBC conversions</p>
            <p>• {sampleRewardPoints.spentSH} RP → SH purchases</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Economic claims • Convertible</p>
          </div>
        </div>

        {/* Timebank Credits */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Timebank Credits</h3>
            <span className="text-xs bg-white dark:bg-gray-800 bg-opacity-20 px-2 py-1 rounded">TBC</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold">{sampleTimebank.balance}</p>
            <p className="text-lg opacity-75">TBC</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Available for exchange</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {sampleTimebank.earned} TBC earned (goods & services sold)</p>
            <p>• {sampleTimebank.spent} TBC spent (goods & services bought)</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Bartering economy • 1-3 TBC/hour</p>
          </div>
        </div>

        {/* Social Horizon */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Social Horizon</h3>
            <span className="text-xs bg-white dark:bg-gray-800 bg-opacity-20 px-2 py-1 rounded">SH</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold">{sampleSocialHorizon.balance}</p>
            <p className="text-lg opacity-75">SH</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Social capital & retirement savings</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {sampleSocialHorizon.issued} SH issued (from contributions)</p>
            <p>• {sampleSocialHorizon.purchased} SH purchased (with RP)</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Stable local currency • Anti-inflation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Allocations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Active Allocations</h2>
          {allocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">No active allocations yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Allocate Support Points to proposals you support
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((alloc) => (
                <div key={alloc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{alloc.target_type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">ID: {alloc.target_id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{alloc.amount} SP</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {new Date(alloc.allocated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">{tx.reason || 'Support Points transaction'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Specification */}
      <div className="mt-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">4-Ledger System Specification</h2>

        {/* Core Invariants */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-900 mb-3">Core Anti-Plutocracy Invariants</h3>
          <div className="space-y-3 text-sm text-red-800">
            <div className="flex gap-3">
              <span className="font-bold text-red-600">1.</span>
              <p><strong>Money/RP ≠ SP:</strong> Governance power (SP) ONLY comes from non-monetary contributions. You cannot buy influence.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-red-600">2.</span>
              <p><strong>One Person, One Vote:</strong> SP controls agenda (which proposals get considered), NOT vote weight. Every member has equal vote power.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-red-600">3.</span>
              <p><strong>Support ≠ Reward:</strong> Separate ledgers for governance (SP) vs. economy (RP, TBC, SH). No conversion between SP and other currencies.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-red-600">4.</span>
              <p><strong>No Buying Big:</strong> Per-person and global caps on SH acquisition prevent wealth concentration. RP burns on SH purchase (cannot recycle).</p>
            </div>
          </div>
        </div>

        {/* Ledger Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Points */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">Support Points (SP)</h3>
            <div className="text-sm text-orange-800 space-y-2">
              <p><strong>Purpose:</strong> Governance power and agenda control</p>
              <p><strong>Sources:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Initial grant: 100 SP</li>
                <li>Governance: Proposals, moderation quality, facilitation, deliberation</li>
                <li>Never from code, money, or RP</li>
              </ul>
              <p><strong>Uses:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Allocate to proposals (10 SP max per proposal)</li>
                <li>Reclaimed when proposal closes</li>
                <li>NEVER convertible to RP, TBC, SH, or money</li>
              </ul>
            </div>
          </div>

          {/* Reward Points */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">Reward Points (RP)</h3>
            <div className="text-sm text-purple-800 space-y-2">
              <p><strong>Purpose:</strong> "The commons owes you something" - economic claims</p>
              <p><strong>Sources:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Code: PRs, docs, reviews, bug fixes</li>
                <li>Engagement: Profile, microlessons, forum, research</li>
                <li>Monthly dues: 100 RP/month</li>
                <li>Donations: 200 RP minimum</li>
              </ul>
              <p><strong>Uses:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Convert to TBC (100 RP = 1 TBC, max 1 TBC/month)</li>
                <li>Purchase SH in rare events (strict caps, RP burns)</li>
                <li>Unlock perks (priority seats, raffles)</li>
              </ul>
            </div>
          </div>

          {/* Timebank Credits */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Timebank Credits (TBC)</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Purpose:</strong> Bartering economy for goods and services exchange</p>
              <p><strong>What You Can Barter:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Services: Tutoring, repair, design, consulting (1-3 TBC/hour)</li>
                <li>Goods: Cooked meals, produce, art, crafts</li>
                <li>Skills: Teaching, facilitation, mentorship</li>
              </ul>
              <p><strong>NOT Timebanking:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Mutual aid (free support based on solidarity/empathy)</li>
                <li>Gifts and voluntary contributions</li>
              </ul>
              <p><strong>Sources:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Selling goods or services to members</li>
                <li>Converting RP (100 RP = 1 TBC, max 1 TBC/month)</li>
                <li>Initial grant: 1 TBC</li>
              </ul>
            </div>
          </div>

          {/* Social Horizon */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Social Horizon (SH)</h3>
            <div className="text-sm text-green-800 space-y-2">
              <p><strong>Purpose:</strong> Multi-purpose cooperative currency</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Local and national value exchange</li>
                <li>Social capital building</li>
                <li>Retirement savings (future)</li>
                <li>Stable, trusted, non-inflated currency</li>
              </ul>
              <p><strong>Sources:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Issued to members based on contributions</li>
                <li>Purchased with RP during rare events (RP burns)</li>
              </ul>
              <p><strong>Anti-Whale Rules:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Per-person cap: ~50 SH per event</li>
                <li>Global cap per event (prevents hoarding)</li>
                <li>Fiscal regularity required (consistent membership)</li>
                <li>RP burns on purchase (cannot recycle)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Budget & Financial Flows */}
        <div className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Budget & Financial Flows</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p><strong>Monthly Membership Dues ($5/month):</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Member receives: 100 RP</li>
              <li>Allocated to global budgets (Ops, Dev, Mutual Aid, Legal)</li>
            </ul>
            <p className="mt-3"><strong>Donations (any amount, min $20):</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Donor receives: 200 RP + bonus for larger amounts</li>
              <li>Allocated to global budgets or specific campaigns</li>
            </ul>
            <p className="mt-3"><strong>RP → TBC Conversion (100 RP = 1 TBC):</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Monthly throttling: Max 1 TBC per member per month</li>
              <li>Prevents point farming while allowing access to mutual aid</li>
            </ul>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Implementation Status</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Database schema with 12 tables (migration 023)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>TypeScript types for all 4 ledgers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Backend functions for RP, TBC, SH, and budgets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-bold">⟳</span>
              <span>API endpoints and UI integration (in progress)</span>
            </div>
            <p className="mt-4 text-xs opacity-75 flex items-center gap-1">
              <span>Full specification:</span>
              <a
                href="https://github.com/coopeverything/TogetherOS/blob/yolo/docs/guides/4-ledger-system.md"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                docs/guides/4-ledger-system.md
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
