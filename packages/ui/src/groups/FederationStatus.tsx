/**
 * FederationStatus Component
 *
 * Shows federation connections and status for a group
 */

'use client'

export interface FederatedConnection {
  id: string
  remoteGroupHandle: string
  remoteInstance: string
  syncedAt: Date
  status: 'active' | 'paused' | 'error'
  operations: ('proposals' | 'events' | 'members')[]
}

export interface FederationStatusProps {
  /** Group handle */
  groupHandle: string

  /** Federation connections */
  connections: FederatedConnection[]

  /** Callback when adding new connection */
  onAddConnection?: () => void

  /** Optional CSS class name */
  className?: string
}

function getStatusColor(status: FederatedConnection['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
  }
}

export function FederationStatus({
  groupHandle,
  connections,
  onAddConnection,
  className = '',
}: FederationStatusProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Federation Status</h2>
          <p className="text-base text-gray-600 mt-1">@{groupHandle}</p>
        </div>
        {onAddConnection && (
          <button
            onClick={onAddConnection}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Add Connection
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">What is Federation?</h3>
        <p className="text-base text-blue-800">
          Federation allows your group to connect with groups on other TogetherOS instances,
          enabling cross-instance proposals, events, and coordination while maintaining local
          autonomy.
        </p>
      </div>

      {/* Connections */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Connections ({connections.length})
        </h3>

        {connections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No federation connections</p>
            <p className="text-gray-400 text-base mt-2">
              {onAddConnection
                ? 'Connect with groups on other instances to coordinate across platforms'
                : 'Federation connections will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {connection.remoteGroupHandle}
                    </h4>
                    <p className="text-base text-gray-500">{connection.remoteInstance}</p>
                  </div>
                  <span
                    className={`px-3 py-1.5 text-base font-medium rounded-full ${getStatusColor(connection.status)}`}
                  >
                    {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-base text-gray-600 mb-2">Shared operations:</p>
                  <div className="flex flex-wrap gap-2">
                    {connection.operations.map((op) => (
                      <span
                        key={op}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 text-sm rounded-full"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Last synced: {new Date(connection.syncedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
