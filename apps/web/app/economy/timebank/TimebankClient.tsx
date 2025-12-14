'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TBCWalletCard,
  ServiceBrowser,
  RPToTBCConverter,
  type TimebankServiceItem,
} from '@togetheros/ui/economy';

interface TBCAccount {
  memberId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FairExchangeIndex {
  value: number;
  status: 'excellent' | 'good' | 'balanced' | 'warning' | 'critical';
}

interface ConversionStatus {
  rpAvailable: number;
  monthlyAllowance: number;
  alreadyConverted: number;
  rpPerTBC: number;
}

export default function TimebankClient() {
  const router = useRouter();
  const [account, setAccount] = useState<TBCAccount | null>(null);
  const [fairExchangeIndex, setFairExchangeIndex] = useState<FairExchangeIndex | null>(null);
  const [services, setServices] = useState<TimebankServiceItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'marketplace' | 'my-services' | 'browse' | 'convert'>('wallet');

  function handleTabClick(tabId: string) {
    if (tabId === 'marketplace') {
      router.push('/economy/timebank/marketplace');
    } else if (tabId === 'my-services') {
      router.push('/economy/timebank/my-services');
    } else {
      setActiveTab(tabId as typeof activeTab);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load TBC account
      const accountRes = await fetch('/api/timebank/account');
      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccount(data.account);
        setFairExchangeIndex(data.fairExchangeIndex);
      }

      // Load conversion status
      const convRes = await fetch('/api/reward-points/convert-to-tbc');
      if (convRes.ok) {
        const data = await convRes.json();
        setConversionStatus({
          rpAvailable: data.rpBalance?.available || 0,
          monthlyAllowance: data.limits?.monthlyAllowanceRP || 100,
          alreadyConverted: data.limits?.convertedThisMonthRP || 0,
          rpPerTBC: data.limits?.rpPerTBC || 100,
        });
      }

      // Load services
      await loadServices();

      setLoading(false);
    } catch (err) {
      console.error('Load data error:', err);
      setLoading(false);
    }
  }

  async function loadServices(filters?: { type?: string; location?: string; maxPrice?: number }) {
    try {
      setServicesLoading(true);
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.location) params.set('location', filters.location);
      if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice.toString());

      const res = await fetch(`/api/timebank/services?${params}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setServiceTypes(data.filters?.availableTypes || []);
      }
      setServicesLoading(false);
    } catch (err) {
      console.error('Load services error:', err);
      setServicesLoading(false);
    }
  }

  async function handleRequestService(serviceId: string) {
    try {
      const res = await fetch('/api/timebank/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });

      if (res.ok) {
        alert('Service request sent! The provider will be notified.');
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to request service');
      }
    } catch (err) {
      alert('Failed to request service');
    }
  }

  async function handleConvert(rpAmount: number) {
    const res = await fetch('/api/reward-points/convert-to-tbc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rpAmount }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Conversion failed');
    }

    loadData();
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-4"></div>
          <p className="mt-2 text-ink-400">Loading Timebank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <a href="/economy" className="text-accent-4 hover:text-accent-4/80 text-sm mb-2 inline-block">
          &larr; Back to Economy
        </a>
        <h1 className="text-sm font-bold text-ink-900">Timebank Credits</h1>
        <p className="text-ink-400 mt-2">
          Exchange goods and services with fellow members using TBC
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-3">
        <nav className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'wallet', label: 'My Wallet' },
            { id: 'marketplace', label: '🛒 Marketplace' },
            { id: 'my-services', label: '📋 My Services' },
            { id: 'browse', label: 'Browse' },
            { id: 'convert', label: 'Convert RP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent-4 text-accent-4'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Marketplace Tab - Redirect to full page */}
      {activeTab === 'marketplace' && (
        <div className="text-center py-8">
          <p className="text-ink-500 mb-4">Opening marketplace...</p>
          <a
            href="/economy/timebank/marketplace"
            className="inline-flex px-6 py-3 bg-brand-600 text-bg-1 font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            Go to Marketplace →
          </a>
          <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/economy/timebank/marketplace';` }} />
        </div>
      )}

      {/* My Services Tab - Redirect to full page */}
      {activeTab === 'my-services' && (
        <div className="text-center py-8">
          <p className="text-ink-500 mb-4">Opening my services...</p>
          <a
            href="/economy/timebank/my-services"
            className="inline-flex px-6 py-3 bg-brand-600 text-bg-1 font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            Go to My Services →
          </a>
          <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/economy/timebank/my-services';` }} />
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && account && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TBCWalletCard
            account={account}
            fairExchangeIndex={fairExchangeIndex || undefined}
          />

          {/* Quick Actions */}
          <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('browse')}
                className="w-full py-2 px-4 bg-accent-4 hover:bg-accent-4/90 text-bg-1 font-medium rounded-lg transition-colors"
              >
                Browse Available Services
              </button>
              <button
                onClick={() => setActiveTab('convert')}
                className="w-full py-2 px-4 bg-accent-3 hover:bg-accent-3/90 text-bg-1 font-medium rounded-lg transition-colors"
              >
                Convert RP to TBC
              </button>
              <a
                href="/economy/timebank/my-services"
                className="block w-full py-2 px-4 bg-bg-2 hover:bg-bg-2/80 text-ink-900 font-medium rounded-lg transition-colors text-center"
              >
                Manage My Services
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Browse Services Tab */}
      {activeTab === 'browse' && (
        <ServiceBrowser
          services={services}
          serviceTypes={serviceTypes}
          onRequestService={handleRequestService}
          onFilterChange={(filters) => loadServices(filters)}
          isLoading={servicesLoading}
        />
      )}

      {/* Convert RP Tab */}
      {activeTab === 'convert' && conversionStatus && (
        <div className="max-w-md">
          <RPToTBCConverter
            rpAvailable={conversionStatus.rpAvailable}
            monthlyAllowance={conversionStatus.monthlyAllowance}
            alreadyConverted={conversionStatus.alreadyConverted}
            rpPerTBC={conversionStatus.rpPerTBC}
            onConvert={handleConvert}
          />
        </div>
      )}
    </div>
  );
}
