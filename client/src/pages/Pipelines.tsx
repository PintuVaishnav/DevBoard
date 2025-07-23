import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNowStrict } from 'date-fns';

export default function GitHubActions() {
  const { data: runs, isLoading, error } = useQuery({
    queryKey: ['githubActions'],
    queryFn: async () => {
      const res = await fetch('/api/github/actions', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load GitHub Actions runs');
      return res.json();
    },
  });

  const getStatusBadge = (status: string, conclusion: string) => {
    if (status === 'in_progress')
      return <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>;
    if (status === 'completed' && conclusion === 'success')
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    if (status === 'completed' && conclusion === 'failure')
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
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
    return <div className="text-red-600 dark:text-red-400">Error loading actions.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Actions Runs</h2>
      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Workflow Runs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Repo', 'Commit Msg', 'Status', 'Branch', 'Duration', 'Updated'].map(col => (
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
                {runs.map((run: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {run.repo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {run.commitMessage || '—'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(run.status, run.conclusion)}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500 dark:text-gray-400">
                      {run.branch}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {run.duration ? formatDuration(run.duration) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
  {run.created_at ? (
    <a
      href={run.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      {formatDistanceToNowStrict(new Date(run.created_at))}
    </a>
  ) : (
    '—'
  )}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!runs.length && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No workflow runs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
