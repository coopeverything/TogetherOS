'use client';

import { useState, useEffect } from 'react';
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
  const [account, setAccount] = useState<TBCAccount | null>(null);
  const [fairExchangeIndex, setFairExchangeIndex] = useState<FairExchangeIndex | null>(null);
  const [services, setServices] = useState<TimebankServiceItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'browse' | 'convert'>('wallet');

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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading Timebank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-4">
        <a href="/economy" className="text-teal-600 hover:text-teal-700 text-sm mb-2 inline-block">
          &larr; Back to Economy
        </a>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white">Timebank Credits</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Exchange goods and services with fellow members using TBC
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-3">
        <nav className="flex space-x-8">
          {['wallet', 'browse', 'convert'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'wallet' ? 'My Wallet' : tab === 'browse' ? 'Browse Services' : 'Convert RP'}
            </button>
          ))}
        </nav>
      </div>

      {/* Wallet Tab */}
      {activeTab === 'wallet' && account && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TBCWalletCard
            account={account}
            fairExchangeIndex={fairExchangeIndex || undefined}
          />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('browse')}
                className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Available Services
              </button>
              <button
                onClick={() => setActiveTab('convert')}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Convert RP to TBC
              </button>
              <a
                href="/economy/timebank/my-services"
                className="block w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-center"
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
