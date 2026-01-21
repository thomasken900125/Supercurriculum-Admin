'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Cpu, HardDrive, MemoryStick, RefreshCw, Server } from 'lucide-react';
import { useState } from 'react';

export default function SystemInfoPage() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: systemInfo, isLoading, refetch } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => api.getSystemInfo(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading system information...</div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load system information</div>
      </div>
    );
  }

  const { cpu, ram, storage } = systemInfo;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Server Resources</h1>
          <p className="text-gray-500 mt-1">Monitor CPU, RAM, and storage usage</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hostname</h3>
                <p className="text-lg font-semibold text-gray-900">{systemInfo.hostname}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Platform:</span>
              <span className="text-gray-900 font-medium">{systemInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Architecture:</span>
              <span className="text-gray-900 font-medium">{systemInfo.arch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Uptime:</span>
              <span className="text-gray-900 font-medium">{systemInfo.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Node.js:</span>
              <span className="text-gray-900 font-medium">{systemInfo.nodeVersion}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Cpu className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
                <p className="text-lg font-semibold text-gray-900">{cpu.usage}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Model:</span>
              <span className="text-gray-900 font-medium text-xs">{cpu.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cores:</span>
              <span className="text-gray-900 font-medium">{cpu.cores}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Speed:</span>
              <span className="text-gray-900 font-medium">{cpu.speed}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  parseFloat(cpu.usage) > 80 ? 'bg-red-500' :
                  parseFloat(cpu.usage) > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(parseFloat(cpu.usage), 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MemoryStick className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">RAM Usage</h3>
                <p className="text-lg font-semibold text-gray-900">{ram.usagePercent}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="text-gray-900 font-medium">{ram.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Used:</span>
              <span className="text-gray-900 font-medium">{ram.used}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Free:</span>
              <span className="text-gray-900 font-medium">{ram.free}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  parseFloat(ram.usagePercent) > 80 ? 'bg-red-500' :
                  parseFloat(ram.usagePercent) > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(parseFloat(ram.usagePercent), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <HardDrive className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Storage</h2>
              <p className="text-sm text-gray-500">Disk space usage</p>
            </div>
          </div>
        </div>

        {storage.error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{storage.error}</p>
            {storage.note && (
              <p className="text-yellow-700 text-sm mt-2">{storage.note}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Storage</div>
                <div className="text-2xl font-semibold text-gray-900">{storage.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Used Storage</div>
                <div className="text-2xl font-semibold text-gray-900">{storage.used}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Free Storage</div>
                <div className="text-2xl font-semibold text-gray-900">{storage.free}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Usage</span>
                <span className="text-gray-900 font-medium">{storage.usagePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    parseFloat(storage.usagePercent) > 90 ? 'bg-red-500' :
                    parseFloat(storage.usagePercent) > 75 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(parseFloat(storage.usagePercent), 100)}%` }}
                />
              </div>
            </div>

            {storage.drive && (
              <div className="text-sm text-gray-500">
                Drive: <span className="text-gray-900 font-medium">{storage.drive}</span>
              </div>
            )}
            {storage.mountPoint && (
              <div className="text-sm text-gray-500">
                Mount Point: <span className="text-gray-900 font-medium">{storage.mountPoint}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Last updated: {systemInfo.timestamp ? new Date(systemInfo.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
}

