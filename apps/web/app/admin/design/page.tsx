'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Label,
  Checkbox,
  Radio,
  Select,
  Card,
  Badge,
  Alert,
  Modal,
  Tabs,
  Spinner,
  Tooltip,
  Dropdown,
  Accordion,
  Progress,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  useToast,
  Breadcrumb,
  Pagination,
  Avatar,
  AvatarGroup,
  Skeleton,
  SkeletonCard,
  EmptyState,
  EmptyStateIcons,
  CommandPalette,
  CommandItem,
} from '@/components/ui';

export default function DesignShowcase() {
  const [darkMode, setDarkMode] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<'calm' | 'compact'>('calm');
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(65);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { addToast } = useToast();

  // Command palette items
  const commandItems: CommandItem[] = [
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Navigate to homepage',
      onSelect: () => addToast({ description: 'Navigating to Home...', variant: 'info' }),
      keywords: ['home', 'dashboard'],
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Manage your account settings',
      onSelect: () => addToast({ description: 'Opening Settings...', variant: 'info' }),
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'profile',
      label: 'View Profile',
      description: 'Go to your profile page',
      onSelect: () => addToast({ description: 'Viewing Profile...', variant: 'info' }),
      keywords: ['profile', 'user', 'account'],
    },
    {
      id: 'dark-mode',
      label: 'Toggle Dark Mode',
      description: 'Switch between light and dark themes',
      onSelect: () => {
        setDarkMode(!darkMode);
        addToast({ description: `Switched to ${!darkMode ? 'dark' : 'light'} mode`, variant: 'success' });
      },
      keywords: ['dark', 'light', 'theme'],
    },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style jsx global>{`
        :root {
          --bg-0: #FAFAF9;
          --bg-1: #FFFFFF;
          --bg-2: #F5F5F4;
          --ink-900: #0F172A;
          --ink-700: #334155;
          --ink-400: #94A3B8;
          --border: #E5E7EB;
          --brand-600: #059669;
          --brand-500: #10B981;
          --brand-100: #D1FAE5;
          --joy-600: #F59E0B;
          --joy-500: #FDBA74;
          --joy-100: #FFF7ED;
          --success: #16A34A;
          --success-bg: #DCFCE7;
          --info: #0EA5E9;
          --info-bg: #E0F2FE;
          --warn: #D97706;
          --warn-bg: #FEF3C7;
          --danger: #DC2626;
          --danger-bg: #FEE2E2;
        }

        .dark {
          --bg-0: #0B0F14;
          --bg-1: #0F141A;
          --bg-2: #121922;
          --ink-900: #E5E7EB;
          --ink-700: #CBD5E1;
          --ink-400: #94A3B8;
          --border: #1F2937;
          --brand-500: #22C55E;
          --joy-500: #FBBF24;
        }

        body {
          background: var(--bg-0);
          color: var(--ink-900);
          font-family: Inter, -apple-system, sans-serif;
          line-height: 1.6;
        }
      `}</style>

      <div style={{ background: 'var(--bg-0)', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          background: 'var(--bg-1)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
              TogetherOS Design System
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'var(--bg-2)',
                color: 'var(--ink-700)',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>

          {/* Philosophy */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
              Warm Minimalism
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--ink-700)', maxWidth: '68ch', lineHeight: 1.7 }}>
              Clean, joyful, and restful. Lots of white space, soft neutrals, one lively accent,
              and a gentle warm companion. Text stays dark and readable; accents do the emotional work.
            </p>
          </section>

          {/* UI Components Library */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Component Library
            </h2>

            {/* Buttons */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Buttons
              </h3>
              <Card className="flex gap-3 flex-wrap items-center">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="joy">Joy Accent</Button>
                <Button variant="danger">Danger</Button>
                <Button disabled>Disabled</Button>
              </Card>
            </div>

            {/* Badges */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Badges
              </h3>
              <Card className="flex gap-2 flex-wrap items-center">
                <Badge variant="default">Default</Badge>
                <Badge variant="brand">Brand</Badge>
                <Badge variant="joy">Joy</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </Card>
            </div>

            {/* Alerts */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Alerts
              </h3>
              <div className="space-y-3">
                <Alert variant="default" title="Default Alert">
                  This is a default alert message.
                </Alert>
                <Alert variant="success" title="Success!">
                  Your changes have been saved successfully.
                </Alert>
                <Alert variant="info" title="Information">
                  Please review the updated terms of service.
                </Alert>
                <Alert variant="warning" title="Warning">
                  Your session will expire in 5 minutes.
                </Alert>
                <Alert variant="danger" title="Error">
                  Failed to save changes. Please try again.
                </Alert>
              </div>
            </div>

            {/* Progress Bars */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Progress Bars
              </h3>
              <Card className="space-y-4">
                <Progress value={progressValue} showLabel variant="brand" />
                <Progress value={75} variant="joy" />
                <Progress value={90} variant="success" size="sm" />
                <Progress value={45} variant="warning" size="lg" showLabel />
                <button
                  onClick={() => setProgressValue(Math.min(progressValue + 10, 100))}
                  className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium"
                >
                  Increase Progress
                </button>
              </Card>
            </div>

            {/* Spinners */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Spinners
              </h3>
              <Card className="flex gap-6 items-center">
                <Spinner size="sm" variant="brand" />
                <Spinner size="md" variant="joy" />
                <Spinner size="lg" variant="default" />
              </Card>
            </div>

            {/* Form Components */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Form Components
              </h3>
              <Card className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="Enter your name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select id="role" className="mt-1">
                    <option value="">Select a role</option>
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Checkbox id="terms" label="I agree to the terms and conditions" />
                  <Checkbox id="newsletter" label="Subscribe to newsletter" />
                </div>
                <div className="space-y-2">
                  <Radio name="plan" value="basic" label="Basic Plan" />
                  <Radio name="plan" value="pro" label="Pro Plan" />
                  <Radio name="plan" value="enterprise" label="Enterprise Plan" />
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Tabs
              </h3>
              <Card>
                <Tabs
                  tabs={[
                    { id: 'overview', label: 'Overview', content: <p className="text-ink-700">Overview content goes here...</p> },
                    { id: 'details', label: 'Details', content: <p className="text-ink-700">Details content goes here...</p> },
                    { id: 'settings', label: 'Settings', content: <p className="text-ink-700">Settings content goes here...</p> },
                  ]}
                />
              </Card>
            </div>

            {/* Accordion */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Accordion
              </h3>
              <Accordion
                items={[
                  {
                    id: 'item-1',
                    title: 'What is TogetherOS?',
                    content: 'TogetherOS is a cooperation-first operating system stack designed to support collective action and mutual aid.',
                  },
                  {
                    id: 'item-2',
                    title: 'How does governance work?',
                    content: 'We use participatory decision-making tools including proposals, voting, and consensus building.',
                  },
                  {
                    id: 'item-3',
                    title: 'Can I contribute?',
                    content: 'Yes! All contributions are welcome. Check our GitHub repository for open issues and contributing guidelines.',
                  },
                ]}
                defaultOpen={['item-1']}
              />
            </div>

            {/* Dropdown */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Dropdown
              </h3>
              <Card>
                <Dropdown
                  trigger={
                    <Button variant="secondary">Open Menu</Button>
                  }
                  items={[
                    { label: 'Edit', value: 'edit', onClick: () => alert('Edit clicked') },
                    { label: 'Duplicate', value: 'duplicate', onClick: () => alert('Duplicate clicked') },
                    { label: 'Archive', value: 'archive', onClick: () => alert('Archive clicked') },
                    { label: 'Delete', value: 'delete', onClick: () => alert('Delete clicked'), disabled: true },
                  ]}
                />
              </Card>
            </div>

            {/* Tooltip */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Tooltip
              </h3>
              <Card className="flex gap-4 items-center">
                <Tooltip content="Tooltip on top" position="top">
                  <Button variant="secondary">Hover (Top)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on bottom" position="bottom">
                  <Button variant="secondary">Hover (Bottom)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on left" position="left">
                  <Button variant="secondary">Hover (Left)</Button>
                </Tooltip>
                <Tooltip content="Tooltip on right" position="right">
                  <Button variant="secondary">Hover (Right)</Button>
                </Tooltip>
              </Card>
            </div>

            {/* Modal */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Modal
              </h3>
              <Card>
                <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
                  <p className="text-ink-700 mb-4">
                    This is a modal dialog. Press Escape or click outside to close.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  </div>
                </Modal>
              </Card>
            </div>

            {/* Dialog */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Dialog
              </h3>
              <Card>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <p className="text-ink-700">
                      Are you sure you want to proceed with this action? This cannot be undone.
                    </p>
                  </DialogBody>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                  </DialogFooter>
                </Dialog>
              </Card>
            </div>

            {/* Toast */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Toast Notifications
              </h3>
              <Card className="flex gap-2 flex-wrap">
                <Button onClick={() => addToast({ description: 'This is a default toast' })}>
                  Default Toast
                </Button>
                <Button
                  variant="default"
                  onClick={() => addToast({
                    title: 'Success!',
                    description: 'Your changes have been saved.',
                    variant: 'success'
                  })}
                >
                  Success Toast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addToast({
                    title: 'Info',
                    description: 'New updates are available.',
                    variant: 'info'
                  })}
                >
                  Info Toast
                </Button>
                <Button
                  variant="joy"
                  onClick={() => addToast({
                    title: 'Warning',
                    description: 'Please review your settings.',
                    variant: 'warning'
                  })}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="danger"
                  onClick={() => addToast({
                    title: 'Error',
                    description: 'Failed to save changes.',
                    variant: 'danger',
                    duration: 10000
                  })}
                >
                  Error Toast (10s)
                </Button>
              </Card>
            </div>

            {/* Breadcrumb */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Breadcrumb
              </h3>
              <Card className="space-y-4">
                <Breadcrumb
                  items={[
                    { label: 'Home', href: '/' },
                    { label: 'Design System', href: '/design' },
                    { label: 'Components' },
                  ]}
                />
                <Breadcrumb
                  items={[
                    { label: 'Dashboard', onClick: () => alert('Navigate to Dashboard') },
                    { label: 'Settings', onClick: () => alert('Navigate to Settings') },
                    { label: 'Profile', onClick: () => alert('Navigate to Profile') },
                    { label: 'Edit' },
                  ]}
                  separator="›"
                />
              </Card>
            </div>

            {/* Pagination */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Pagination
              </h3>
              <Card className="space-y-6">
                <div>
                  <p className="text-ink-700 mb-4">
                    Page {currentPage} of 20
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={20}
                    onPageChange={setCurrentPage}
                  />
                </div>
                <div>
                  <p className="text-ink-700 mb-4 text-sm">
                    Without first/last buttons:
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={20}
                    onPageChange={setCurrentPage}
                    showFirstLast={false}
                  />
                </div>
              </Card>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Avatar
              </h3>
              <Card className="space-y-6">
                <div>
                  <p className="text-ink-700 mb-4 text-sm">Sizes:</p>
                  <div className="flex gap-4 items-center">
                    <Avatar size="sm" fallback="S" />
                    <Avatar size="md" fallback="M" />
                    <Avatar size="lg" fallback="L" />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                </div>
                <div>
                  <p className="text-ink-700 mb-4 text-sm">With images:</p>
                  <div className="flex gap-4 items-center">
                    <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
                    <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
                    <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
                    <Avatar src="invalid-url" alt="User 4" fallback="U4" />
                  </div>
                </div>
                <div>
                  <p className="text-ink-700 mb-4 text-sm">Avatar Group:</p>
                  <AvatarGroup max={3}>
                    <Avatar src="https://i.pravatar.cc/150?img=5" alt="User 1" />
                    <Avatar src="https://i.pravatar.cc/150?img=6" alt="User 2" />
                    <Avatar src="https://i.pravatar.cc/150?img=7" alt="User 3" />
                    <Avatar src="https://i.pravatar.cc/150?img=8" alt="User 4" />
                    <Avatar src="https://i.pravatar.cc/150?img=9" alt="User 5" />
                  </AvatarGroup>
                </div>
              </Card>
            </div>

            {/* Skeleton */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Skeleton Loader
              </h3>
              <Card className="space-y-4">
                <Button onClick={() => setShowSkeleton(!showSkeleton)}>
                  {showSkeleton ? 'Hide' : 'Show'} Skeleton
                </Button>
                {showSkeleton ? (
                  <div className="space-y-4">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <div className="flex gap-4">
                      <Skeleton variant="circular" width={40} height={40} />
                      <div className="flex-1">
                        <Skeleton variant="text" lines={3} />
                      </div>
                    </div>
                    <SkeletonCard hasAvatar lines={4} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-ink-900 font-medium">Loaded Content</p>
                    <p className="text-ink-700">This is the actual content that would be displayed after loading.</p>
                    <div className="h-[200px] bg-brand-100 rounded-md flex items-center justify-center text-brand-600">
                      Content Image
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Empty State */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Empty State
              </h3>
              <Card>
                <EmptyState
                  icon={<EmptyStateIcons.NoData />}
                  title="No data available"
                  description="Get started by adding your first item to see it appear here."
                  action={
                    <Button onClick={() => addToast({ description: 'Adding item...', variant: 'success' })}>
                      Add First Item
                    </Button>
                  }
                />
              </Card>
              <Card className="mt-4">
                <EmptyState
                  icon={<EmptyStateIcons.NoResults />}
                  title="No results found"
                  description="Try adjusting your search or filters to find what you're looking for."
                />
              </Card>
            </div>

            {/* Command Palette */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Command Palette
              </h3>
              <Card>
                <p className="text-ink-700 mb-4">
                  Press <kbd className="px-2 py-1 bg-bg-2 border border-border rounded text-xs font-mono">Cmd/Ctrl + K</kbd> to open the command palette
                </p>
                <CommandPalette items={commandItems} />
              </Card>
            </div>
          </section>

          {/* Color Palette */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Color Palette
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Backgrounds */}
              <ColorGroup title="Backgrounds" colors={[
                { name: 'bg-0 (page)', value: darkMode ? '#0B0F14' : '#FAFAF9' },
                { name: 'bg-1 (cards)', value: darkMode ? '#0F141A' : '#FFFFFF' },
                { name: 'bg-2 (panels)', value: darkMode ? '#121922' : '#F5F5F4' },
              ]} />

              {/* Text */}
              <ColorGroup title="Text & Neutrals" colors={[
                { name: 'ink-900 (primary)', value: darkMode ? '#E5E7EB' : '#0F172A' },
                { name: 'ink-700 (secondary)', value: darkMode ? '#CBD5E1' : '#334155' },
                { name: 'ink-400 (muted)', value: '#94A3B8' },
                { name: 'border', value: darkMode ? '#1F2937' : '#E5E7EB' },
              ]} />

              {/* Brand */}
              <ColorGroup title="Brand (Cooperative Green)" colors={[
                { name: 'brand-600', value: '#059669' },
                { name: 'brand-500', value: darkMode ? '#22C55E' : '#10B981' },
                { name: 'brand-100', value: '#D1FAE5' },
              ]} />

              {/* Joy */}
              <ColorGroup title="Joy (Apricot)" colors={[
                { name: 'joy-600', value: '#F59E0B' },
                { name: 'joy-500', value: darkMode ? '#FBBF24' : '#FDBA74' },
                { name: 'joy-100', value: '#FFF7ED' },
              ]} />

              {/* Semantic */}
              <ColorGroup title="Semantic" colors={[
                { name: 'Success', value: '#16A34A', bg: '#DCFCE7' },
                { name: 'Info', value: '#0EA5E9', bg: '#E0F2FE' },
                { name: 'Warning', value: '#D97706', bg: '#FEF3C7' },
                { name: 'Danger', value: '#DC2626', bg: '#FEE2E2' },
              ]} />
            </div>
          </section>

          {/* Typography */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Typography
            </h2>
            <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Heading 1 (36px, Bold)
              </h1>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Heading 2 (28px, Bold)
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--ink-700)', marginBottom: '1rem', maxWidth: '68ch' }}>
                Body text (18px, Regular). Maximum line length of 68-72 characters keeps reading
                comfortable. Line height of 1.6+ gives the text room to breathe.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--ink-400)', maxWidth: '68ch' }}>
                Muted text (16px, Regular) for secondary information and captions.
              </p>
            </div>
          </section>

          {/* Dashboard Mockup */}
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', margin: 0 }}>
                Dashboard Example
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setDashboardMode('calm')}
                  style={{
                    background: dashboardMode === 'calm' ? 'var(--brand-100)' : 'var(--bg-2)',
                    color: dashboardMode === 'calm' ? 'var(--brand-600)' : 'var(--ink-700)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid ' + (dashboardMode === 'calm' ? 'var(--brand-500)' : 'var(--border)'),
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Calm
                </button>
                <button
                  onClick={() => setDashboardMode('compact')}
                  style={{
                    background: dashboardMode === 'compact' ? 'var(--brand-100)' : 'var(--bg-2)',
                    color: dashboardMode === 'compact' ? 'var(--brand-600)' : 'var(--ink-700)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid ' + (dashboardMode === 'compact' ? 'var(--brand-500)' : 'var(--border)'),
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Compact
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: dashboardMode === 'calm' ? 'repeat(auto-fit, minmax(400px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <DashboardTile
                title="Active Members"
                value="147"
                change="+12 this week"
                trend="up"
                accent="brand"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Open Proposals"
                value="8"
                change="3 need your vote"
                trend="neutral"
                accent="joy"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Mutual Aid Requests"
                value="23"
                change="5 unfulfilled"
                trend="down"
                accent="warn"
                mode={dashboardMode}
              />
              <DashboardTile
                title="Treasury Balance"
                value="$12,450"
                change="+8% this month"
                trend="up"
                accent="success"
                mode={dashboardMode}
              />
            </div>
          </section>

          {/* Usage Rules */}
          <section>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '2rem' }}>
              Design Principles
            </h2>
            <div style={{ background: 'var(--bg-1)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <ul style={{ color: 'var(--ink-700)', lineHeight: 2, paddingLeft: '1.5rem' }}>
                <li><strong>One accent per screen</strong> — Choose either brand or joy as the hero, not both</li>
                <li><strong>Big, breathable panels</strong> — Default padding ≥ 2rem, line height 1.6+</li>
                <li><strong>Space first, borders second</strong> — Separate sections with whitespace</li>
                <li><strong>Typography cap</strong> — Max 68-72 characters per line for readability</li>
                <li><strong>Micro transitions</strong> — 150-200ms ease-out, no parallax or looping animations</li>
                <li><strong>Accessibility</strong> — Body text ≥ WCAG AA (aim 7:1 contrast)</li>
              </ul>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: Array<{ name: string; value: string; bg?: string }> }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '1rem' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {colors.map((color) => (
          <div key={color.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: color.value,
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              flexShrink: 0
            }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)' }}>{color.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-400)', fontFamily: 'monospace' }}>{color.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardTile({
  title,
  value,
  change,
  trend,
  accent,
  mode
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  accent: 'brand' | 'joy' | 'success' | 'warn';
  mode: 'calm' | 'compact';
}) {
  const accentColors = {
    brand: 'var(--brand-500)',
    joy: 'var(--joy-500)',
    success: 'var(--success)',
    warn: 'var(--warn)'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div style={{
      background: 'var(--bg-1)',
      padding: mode === 'calm' ? '2rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: mode === 'calm' ? '1.5rem' : '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{
          fontSize: mode === 'calm' ? '1rem' : '0.875rem',
          fontWeight: 600,
          color: 'var(--ink-700)',
          margin: 0
        }}>
          {title}
        </h3>
        <span style={{ fontSize: '1.5rem' }}>{trendIcons[trend]}</span>
      </div>

      <div style={{
        fontSize: mode === 'calm' ? '3rem' : '2.25rem',
        fontWeight: 700,
        color: accentColors[accent],
        lineHeight: 1
      }}>
        {value}
      </div>

      <div style={{
        fontSize: mode === 'calm' ? '0.875rem' : '0.75rem',
        color: 'var(--ink-400)'
      }}>
        {change}
      </div>

      {mode === 'calm' && (
        <button style={{
          background: 'transparent',
          color: accentColors[accent],
          padding: '0.5rem 0',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.875rem'
        }}>
          View details →
        </button>
      )}
    </div>
  );
}
