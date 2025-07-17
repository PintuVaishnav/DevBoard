import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Features() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: featureFlags, isLoading } = useQuery({
    queryKey: ['/api/feature-flags'],
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      await apiRequest('PATCH', `/api/feature-flags/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-flags'] });
      toast({
        title: "Feature flag updated",
        description: "The feature flag has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update feature flag.",
        variant: "destructive",
      });
    },
  });

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and control feature rollouts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Flag
        </Button>
      </div>
      
      <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            {featureFlags?.map((flag: any) => (
              <div key={flag.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{flag.name}</h3>
                    <Badge className={`status-badge ${flag.enabled ? 'status-success' : 'status-disabled'}`}>
                      {flag.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {flag.description || 'No description provided'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Rollout: {flag.rolloutPercentage}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Environment: {flag.environment}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(enabled) => toggleFlag.mutate({ id: flag.id, enabled })}
                    disabled={toggleFlag.isPending}
                  />
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!featureFlags || featureFlags.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No feature flags found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Create your first feature flag to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
