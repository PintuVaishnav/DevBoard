import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNowStrict } from 'date-fns';

export default function HelmPage() {
  const { data: releases, isLoading, error } = useQuery({
    queryKey: ['helmCharts'],
    queryFn: async () => {
      const res = await fetch('/api/helm/releases', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load Helm releases');
      return res.json();
    },
  });

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '—' : `${formatDistanceToNowStrict(date)} ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-64 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">Error loading Helm releases.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Helm Releases</h2>
      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Installed Helm Charts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Name', 'Namespace', 'Chart', 'Status', 'Created'].map(col => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {releases.map((rel: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{rel.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{rel.namespace}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{rel.chart}</td>
                    <td className="px-6 py-4">
                      <Badge className="capitalize">{rel.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTime(rel.updated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!releases.length && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No Helm charts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
