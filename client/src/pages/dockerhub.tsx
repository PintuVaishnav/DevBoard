import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function DockerHubPage() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dockerHub'],
    queryFn: async () => {
      const res = await fetch('/api/dockerhub/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load DockerHub data');
      return res.json();
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error) return <div className="text-red-500">Error loading DockerHub stats</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DockerHub Repositories</h2>
      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Repository Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["Name", "Last Pushed", "Contains", "Visibility", "Scout", "Pull"].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.results.map((repo: any) => {
                const pullCommand = `docker pull ${repo.namespace}/${repo.name}`;

                return (
                  <tr key={repo.name}>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{repo.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDistanceToNowStrict(new Date(repo.last_updated))} ago
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{repo.is_automated ? 'Automated Build' : 'Image'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={repo.is_private ? 'bg-gray-500' : 'bg-green-600'}>
                        {repo.is_private ? 'Private' : 'Public'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-blue-500">{repo.status_description || 'Active'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(pullCommand)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Pull
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!data.results?.length && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No DockerHub repositories found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
