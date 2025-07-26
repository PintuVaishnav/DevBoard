'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function getRelativeTimeFromNow(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return `Just now`;
}

export default function KubernetesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['kubernetesOverview'],
    queryFn: async () => {
      const res = await fetch('/api/kubernetes/overview', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch Kubernetes data');
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400">
        Error loading Kubernetes data.
      </div>
    );
  }

  const unifiedData: any[] = [
    ...(data.clusters || []).map((c: any) => ({
      name: c.name,
      type: 'Cluster',
      namespace: '-',
      status: c.status,
      project: c.projectId,
      created: c.createdAt,
    })),
    ...(data.pods || []).map((p: any) => ({
      name: p.name,
      type: 'Pod',
      namespace: p.namespace,
      status: p.status,
      project: data.projectId || '-',
      created: p.age,
    })),
    ...(data.services || []).map((s: any) => ({
      name: s.name,
      type: 'Service',
      namespace: s.namespace || '-',
      status: s.type,
      project: data.projectId || '-',
      created: '-',
    })),
    ...(data.deployments || []).map((d: any) => ({
      name: d.name,
      type: 'Deployment',
      namespace: d.namespace || '-',
      status: d.status,
      project: data.projectId || '-',
      created: '-',
    })),
    ...(data.nodes || []).map((n: any) => ({
      name: n.name,
      type: 'Node',
      namespace: '-',
      status: n.status,
      project: n.zone || '-',
      created: '-',
    })),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kubernetes Resources</h2>
      <p className="text-gray-600 dark:text-gray-400">All resources in one view</p>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Unified Kubernetes Resource Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-6 px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
            <span>Name</span>
            <span>Type</span>
            <span>Namespace</span>
            <span>Status</span>
            <span>Project</span>
            <span>Created At</span>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {unifiedData.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-6 px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <div>{item.name}</div>
                <div><Badge variant="outline">{item.type}</Badge></div>
                <div>{item.namespace}</div>
                <div><Badge className="bg-blue-600">{item.status}</Badge></div>
                <div>{item.project}</div>
                <div>{item.created !== '-' ? getRelativeTimeFromNow(item.created) : '-'}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
