import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Eye, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Pipelines() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ Fixed useQuery: added queryFn with credentials
  const { data: pipelines, isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
    queryFn: async () => {
      const res = await fetch('/api/pipelines', {
        credentials: 'include', // 🔑 include cookies for session auth
      });
      if (!res.ok) throw new Error('Failed to fetch pipelines');
      return res.json();
    },
  });

  const restartPipeline = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/pipelines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'running' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      toast({
        title: "Pipeline restarted",
        description: "The pipeline has been restarted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restart pipeline.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="status-badge status-success">Success</Badge>;
      case 'running':
        return <Badge className="status-badge status-running">Running</Badge>;
      case 'failed':
        return <Badge className="status-badge status-failed">Failed</Badge>;
      default:
        return <Badge className="status-badge">Unknown</Badge>;
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-64 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CI/CD Pipelines</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your build and deployment pipelines</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Pipeline
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Pipelines
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pipeline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pipelines?.map((pipeline: any) => (
                  <tr key={pipeline.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{pipeline.name}</div>
                      {pipeline.commitMessage && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{pipeline.commitMessage}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(pipeline.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{pipeline.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {pipeline.duration ? formatDuration(pipeline.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {pipeline.status !== 'running' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 dark:text-gray-400"
                            onClick={() => restartPipeline.mutate(pipeline.id)}
                            disabled={restartPipeline.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Restart
                          </Button>
                        )}
                        {pipeline.status === 'running' && (
                          <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                            <Square className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!pipelines || pipelines.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No pipelines found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Create your first pipeline to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
