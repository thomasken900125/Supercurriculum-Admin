'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import api from '@/lib/api';

export default function AlertsPanel() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const queryClient = useQueryClient();

  // Fetch alerts
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['skill-gap-alerts', showUnreadOnly],
    queryFn: async () => {
      return await api.getMySkillGapAlerts();
    },
  });

  // Filter alerts on client side if needed
  const alertsList = Array.isArray(alerts) ? alerts : [];
  const filteredAlerts = showUnreadOnly 
    ? alertsList.filter((a: any) => !a.isRead) 
    : alertsList;

  // Mark alert as read
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await api.markSkillGapAlertAsRead(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-gap-alerts'] });
    },
  });

  // Snooze alert
  const snoozeMutation = useMutation({
    mutationFn: async ({ alertId, until }: { alertId: string; until: string }) => {
      return await api.snoozeSkillGapAlert(alertId, until);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-gap-alerts'] });
    },
  });

  const unreadCount = filteredAlerts.filter((a: any) => !a.isRead).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error loading alerts. Please try again.</p>
        <p className="text-sm text-red-500 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Alert Center</h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showUnreadOnly ? 'Show All' : 'Unread Only'}
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkAsRead={() => markAsReadMutation.mutate(alert.id)}
              onSnooze={(until: string) =>
                snoozeMutation.mutate({ alertId: alert.id, until })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function AlertItem({ alert, onMarkAsRead, onSnooze }: any) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'SEVERE':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'MODERATE':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'MINOR':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const snoozeOptions = [
    { label: '1 hour', hours: 1 },
    { label: '4 hours', hours: 4 },
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
  ];

  return (
    <div
      className={`p-6 ${
        !alert.isRead ? 'bg-blue-50' : ''
      } ${alert.isSnoozed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle
              className={`h-5 w-5 ${
                alert.skillGap?.severity === 'CRITICAL'
                  ? 'text-red-500'
                  : alert.skillGap?.severity === 'SEVERE'
                  ? 'text-orange-500'
                  : 'text-yellow-500'
              }`}
            />
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(
                alert.skillGap?.severity
              )}`}
            >
              {alert.skillGap?.severity}
            </span>
            {!alert.isRead && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-600 text-white">
                NEW
              </span>
            )}
            {alert.isSnoozed && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-600 text-white flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Snoozed
              </span>
            )}
          </div>

          <p className="text-gray-900 font-medium mb-1">{alert.message}</p>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Student ID: {alert.studentId}</p>
            <p>
              Detected:{' '}
              {new Date(alert.createdAt).toLocaleDateString()}{' '}
              {new Date(alert.createdAt).toLocaleTimeString()}
            </p>
            {alert.skillGap?.interventionAssignments?.length > 0 && (
              <p className="text-green-600 font-medium">
                ✓ Intervention assigned
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {!alert.isRead && (
            <button
              onClick={onMarkAsRead}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark Read
            </button>
          )}

          {!alert.isSnoozed && (
            <div className="relative">
              <button
                onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Clock className="h-3 w-3 mr-1" />
                Snooze
              </button>

              {showSnoozeOptions && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {snoozeOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        const until = new Date();
                        until.setHours(until.getHours() + option.hours);
                        onSnooze(until.toISOString());
                        setShowSnoozeOptions(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700">
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </button>
        </div>
      </div>

      {/* Skill Gap Details */}
      {alert.skillGap && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Score</p>
              <p className="font-medium text-lg">
                {alert.skillGap.percentageScore}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Detected</p>
              <p className="font-medium">
                {new Date(alert.skillGap.lastDetected).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">
                {alert.skillGap.isResolved ? (
                  <span className="text-green-600">Resolved</span>
                ) : (
                  <span className="text-red-600">Active</span>
                )}
              </p>
            </div>
          </div>

          {alert.skillGap.notes && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Notes</p>
              <p className="text-sm text-gray-700">{alert.skillGap.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

