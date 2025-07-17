import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Tag } from 'lucide-react';

export default function Releases() {
  const { data: releaseNotes, isLoading } = useQuery({
    queryKey: ['/api/release-notes'],
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'release':
        return <Badge className="status-badge status-success">Release</Badge>;
      case 'hotfix':
        return <Badge className="status-badge status-failed">Hotfix</Badge>;
      case 'feature':
        return <Badge className="status-badge status-running">Feature</Badge>;
      default:
        return <Badge className="status-badge">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Release Notes</h2>
          <p className="text-gray-600 dark:text-gray-400">Track software releases and updates</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Release
        </Button>
      </div>
      
      <div className="space-y-4">
        {releaseNotes?.map((release: any) => (
          <Card key={release.id} className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {release.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {release.version}
                      </span>
                      {getTypeBadge(release.type)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {new Date(release.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {release.content}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!releaseNotes || releaseNotes.length === 0) && (
          <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">No release notes found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Create your first release note to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
