import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function getRelativeTimeFromNow(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return `Just now`;
}

export default function GcpPage() {
  const { data: gcpResources, isLoading, error } = useQuery({
    queryKey: ['gcpResources'],
    queryFn: async () => {
      const res = await fetch('/api/gcp/resources', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load GCP data');
      return res.json();
    },
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
        Error loading GCP resources.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GCP Resources</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Virtual machines, storage buckets, and GKE clusters from your GCP project.
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Resources Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-5 px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
            <span>Name</span>
            <span>Type</span>
            <span>Status</span>
            <span>Zone</span>
            <span>Created</span>
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {gcpResources?.map((res: any, i: number) => (
              <div
                key={i}
                className="grid grid-cols-5 px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <div className="font-medium">{res.name}</div>
                <div><Badge>{res.type}</Badge></div>
                <div>
                  <Badge
                    className={
                      res.status === 'RUNNING'
                        ? 'bg-green-700'
                        : res.status === 'TERMINATED'
                        ? 'bg-red-700'
                        : 'bg-gray-600'
                    }
                  >
                    {res.status}
                  </Badge>
                </div>
                <div>{res.zone}</div>
                <div className="whitespace-nowrap">{getRelativeTimeFromNow(res.createdAt)}</div>
              </div>
            ))}

            {/* Empty State */}
            {(!gcpResources || gcpResources.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No GCP resources found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
