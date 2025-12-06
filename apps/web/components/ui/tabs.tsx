import * as React from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div
        role="tablist"
        className="flex border-b border-border overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
                  : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={activeTab}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';

export { Tabs };
