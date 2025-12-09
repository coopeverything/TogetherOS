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

interface RPBalance {
  total_earned: number;
  available: number;
  spent_on_tbc: number;
  spent_on_sh: number;
}

interface TBCAccount {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface SHWallet {
  shBalance: number;
  totalIssued: number;
  ownershipPercentage: number;
}

export default function EconomyClient() {
  const [balance, setBalance] = useState<SupportPointsBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [rpBalance, setRpBalance] = useState<RPBalance | null>(null);
  const [tbcAccount, setTbcAccount] = useState<TBCAccount | null>(null);
  const [shWallet, setShWallet] = useState<SHWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load SP balance
      const balanceResponse = await fetch('/api/support-points/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance);
      }

      // Load SP transactions
      const txResponse = await fetch('/api/support-points/transactions?limit=10');
      if (txResponse.ok) {
        const txData = await txResponse.json();
        setTransactions(txData.transactions || []);
      }

      // Load SP allocations
      const allocResponse = await fetch('/api/support-points/allocations');
      if (allocResponse.ok) {
        const allocData = await allocResponse.json();
        setAllocations(allocData.allocations || []);
      }

      // Load RP balance
      const rpResponse = await fetch('/api/reward-points/balance');
      if (rpResponse.ok) {
        const rpData = await rpResponse.json();
        setRpBalance(rpData.balance);
      }

      // Load TBC account
      const tbcResponse = await fetch('/api/timebank/account');
      if (tbcResponse.ok) {
        const tbcData = await tbcResponse.json();
        setTbcAccount(tbcData.account);
      }

      // Load SH wallet
      const shResponse = await fetch('/api/social-horizon/wallet');
      if (shResponse.ok) {
        const shData = await shResponse.json();
        setShWallet(shData.wallet);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load economy data');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-ink-400">Loading Support Points...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="bg-danger-bg border border-danger/30 rounded-lg p-4">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-sm font-bold text-ink-900">Your Cooperative Economy</h1>
          <span className="px-3 py-1 bg-success-bg text-success text-sm font-medium rounded-full">
            Active
          </span>
        </div>
        <p className="text-sm text-ink-400 max-w-3xl">
          A comprehensive cooperative economy with four interlinked ledgers: Support Points (governance), Reward Points (economic claims), Timebank Credits (mutual aid), and Social Horizon (cooperative currency).
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Support Points Balance */}
        <a href="/economy/support-points" className="bg-gradient-to-br from-joy-500 to-joy-600 rounded-lg p-4 text-bg-1 shadow-lg hover:shadow-xl transition-shadow cursor-pointer block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Support Points</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">SP</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-sm font-bold">{balance?.available || 0}</p>
            <p className="text-sm opacity-75">/ {balance?.total || 0}</p>
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
        </a>

        {/* Reward Points */}
        <a href="/economy/reward-points" className="bg-gradient-to-br from-accent-3 to-accent-3/90 rounded-lg p-4 text-bg-1 shadow-lg hover:shadow-xl transition-shadow cursor-pointer block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Reward Points</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">RP</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-sm font-bold">{rpBalance?.available || 0}</p>
            <p className="text-sm opacity-75">/ {rpBalance?.total_earned || 0}</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Available to convert or spend</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {rpBalance?.spent_on_tbc || 0} RP → TBC conversions</p>
            <p>• {rpBalance?.spent_on_sh || 0} RP → SH purchases</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Economic claims • Convertible</p>
          </div>
        </a>

        {/* Timebank Credits */}
        <a href="/economy/timebank" className="bg-gradient-to-br from-accent-4 to-accent-4/90 rounded-lg p-4 text-bg-1 shadow-lg hover:shadow-xl transition-shadow cursor-pointer block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Timebank Credits</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">TBC</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-sm font-bold">{tbcAccount?.balance?.toFixed(1) || '0.0'}</p>
            <p className="text-sm opacity-75">TBC</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Available for exchange</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {tbcAccount?.totalEarned?.toFixed(1) || '0.0'} TBC earned</p>
            <p>• {tbcAccount?.totalSpent?.toFixed(1) || '0.0'} TBC spent</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Bartering economy • 1-10 TBC/hour</p>
          </div>
        </a>

        {/* Social Horizon */}
        <a href="/economy/social-horizon" className="bg-gradient-to-br from-success to-success/90 rounded-lg p-4 text-bg-1 shadow-lg hover:shadow-xl transition-shadow cursor-pointer block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Social Horizon</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">SH</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-sm font-bold">{shWallet?.shBalance?.toFixed(2) || '0.00'}</p>
            <p className="text-sm opacity-75">SH</p>
          </div>
          <p className="text-sm opacity-75 mb-1">Cooperative ownership stake</p>
          <div className="text-xs opacity-90 space-y-1">
            <p>• {shWallet?.totalIssued?.toFixed(2) || '0.00'} SH total received</p>
            <p>• {shWallet?.ownershipPercentage?.toFixed(4) || '0.0000'}% ownership</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75">Non-tradable • Long-term stake</p>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Allocations */}
        <div className="bg-bg-1 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Active Allocations</h2>
          {allocations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-ink-400">No active allocations yet</p>
              <p className="text-sm text-ink-400 mt-2">
                Allocate Support Points to proposals you support
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.map((alloc) => (
                <div key={alloc.id} className="flex items-center justify-between p-4 bg-bg-2 rounded-lg">
                  <div>
                    <p className="font-medium text-ink-900">{alloc.target_type}</p>
                    <p className="text-sm text-ink-400">ID: {alloc.target_id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-joy-600">{alloc.amount} SP</p>
                    <p className="text-xs text-ink-400">
                      {new Date(alloc.allocated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-bg-1 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-ink-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                        ${tx.type === 'earn' || tx.type === 'initial' || tx.type === 'reclaim'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-joy-100 text-joy-800'}
                      `}>
                        {tx.type}
                      </span>
                      <span className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-brand-600' : 'text-joy-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} SP
                      </span>
                    </div>
                    <p className="text-sm text-ink-400 mt-1">{tx.reason || 'Support Points transaction'}</p>
                    <p className="text-xs text-ink-400 mt-1">
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
      <div className="mt-4 space-y-2">
        <h2 className="text-sm font-bold text-ink-900">How Your Economy Works</h2>

        {/* Core Invariants */}
        <div className="bg-danger-bg border-2 border-danger/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-danger mb-3">Core Anti-Plutocracy Invariants</h3>
          <div className="space-y-3 text-sm text-danger/90">
            <div className="flex gap-3">
              <span className="font-bold text-danger">1.</span>
              <p><strong>Money/RP ≠ SP:</strong> Governance power (SP) ONLY comes from non-monetary contributions. You cannot buy influence.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-danger">2.</span>
              <p><strong>One Person, One Vote:</strong> SP controls agenda (which proposals get considered), NOT vote weight. Every member has equal vote power.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-danger">3.</span>
              <p><strong>Support ≠ Reward:</strong> Separate ledgers for governance (SP) vs. economy (RP, TBC, SH). No conversion between SP and other currencies.</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-danger">4.</span>
              <p><strong>No Buying Big:</strong> Per-person and global caps on SH acquisition prevent wealth concentration. RP burns on SH purchase (cannot recycle).</p>
            </div>
          </div>
        </div>

        {/* Ledger Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Support Points */}
          <div className="bg-joy-bg border-2 border-joy/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-joy-700 mb-3">Support Points (SP)</h3>
            <div className="text-sm text-joy-700/90 space-y-2">
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
          <div className="bg-accent-3-bg border-2 border-accent-3/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-accent-3 mb-3">Reward Points (RP)</h3>
            <div className="text-sm text-accent-3/90 space-y-2">
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
          <div className="bg-accent-4-bg border-2 border-accent-4/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-accent-4 mb-3">Timebank Credits (TBC)</h3>
            <div className="text-sm text-accent-4/90 space-y-2">
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
          <div className="bg-success-bg border-2 border-success/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-success mb-3">Social Horizon (SH)</h3>
            <div className="text-sm text-success/90 space-y-2">
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
        <div className="bg-bg-2 border-2 border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">Budget & Financial Flows</h3>
          <div className="text-sm text-ink-700 space-y-2">
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

      </div>
    </div>
  );
}
