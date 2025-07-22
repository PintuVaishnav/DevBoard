import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GitHubRepo() {
  const { data: githubRepo, isLoading, error } = useQuery({
    queryKey: ['githubRepo'],
    queryFn: async () => {
      const res = await fetch('/api/github/repos', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch GitHub repos');
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
        Error loading GitHub repositories.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section like Pipelines */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Repositories</h2>
          <p className="text-gray-600 dark:text-gray-400">
            List of repositories connected with your GitHub account.
          </p>
        </div>
      </div>

      {/* Repos Display Card */}
      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Connected Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {githubRepo?.map((repo: any) => (
              <div key={repo.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center"
                    >
                      {repo.name}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{repo.visibility}</Badge>
                      <Badge variant="outline">{repo.language || 'Unknown'}</Badge>
                      {repo.private && <Badge variant="destructive">Private</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    ⭐ {repo.stargazers_count}
                  </div>
                </div>
              </div>
            ))}

            {(!githubRepo || githubRepo.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Make sure your GitHub token is valid and has the right permissions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}