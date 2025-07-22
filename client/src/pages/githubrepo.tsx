import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, GitBranch } from 'lucide-react';

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

export default function GitHubRepo() {
  const { data: githubRepo, isLoading, error } = useQuery({
    queryKey: ['githubRepo'],
    queryFn: async () => {
      const res = await fetch('/api/github/repos', { credentials: 'include' });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Repositories</h2>
          <p className="text-gray-600 dark:text-gray-400">
            List of repositories connected with your GitHub account.
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Connected Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-6 px-6 py-3 font-semibold text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
            <span>Name</span>
            <span>Visibility</span>
            <span>Language</span>
            <span>Access</span>
            <span>Fork</span>
            <span>Last Updated</span>
          </div>

          {/* Repo Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {githubRepo?.map((repo: any) => (
              <div
                key={repo.id}
                className="grid grid-cols-6 px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                {/* Name */}
                <div className="font-medium">{repo.name}</div>

                {/* Visibility */}
                <div>
                  <Badge
                    className={
                      repo.visibility === 'private'
                        ? 'bg-red-800'
                        : 'bg-blue-800'
                    }
                  >
                    {repo.visibility}
                  </Badge>
                </div>

                {/* Language */}
                <div>
                  <Badge variant="outline">{repo.language || 'Unknown'}</Badge>
                </div>

                {/* Access Button */}
                <div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View <ExternalLink className="ml-1 h-4 w-4" />
                    </Button>
                  </a>
                </div>

                {/* Fork Button */}
                <div>
                  <a
                    href={`${repo.html_url}/fork`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Fork <GitBranch className="ml-1 h-4 w-4" />
                    </Button>
                  </a>
                </div>

                {/* Last Updated */}
                <div className="whitespace-nowrap">
                  {getRelativeTimeFromNow(repo.updated_at)}
                </div>
              </div>
            ))}

            {/* Empty State */}
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
