import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Github, Cloud, Activity, MessageSquare } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const serviceIcons = {
  github: Github,
  aws: Cloud,
  prometheus: Activity,
  slack: MessageSquare,
};

export default function Tokens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newToken, setNewToken] = useState({
    service: '',
    tokenName: '',
    tokenValue: '',
    configuration: {}
  });

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['/api/tokens'],
  });

  const createToken = useMutation({
    mutationFn: async (tokenData: any) => {
      await apiRequest('POST', '/api/tokens', tokenData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      toast({
        title: "Token created",
        description: "The API token has been created successfully.",
      });
      setNewToken({ service: '', tokenName: '', tokenValue: '', configuration: {} });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create token.",
        variant: "destructive",
      });
    },
  });

  const deleteToken = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tokens/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      toast({
        title: "Token deleted",
        description: "The API token has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete token.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newToken.service && newToken.tokenName && newToken.tokenValue) {
      createToken.mutate(newToken);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-64 animate-pulse"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Tokens</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage API tokens for external service integrations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Integration */}
        <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>GitHub Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="github-token">Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={newToken.service === 'github' ? newToken.tokenValue : ''}
                  onChange={(e) => setNewToken({
                    ...newToken,
                    service: 'github',
                    tokenName: 'GitHub Token',
                    tokenValue: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="github-repo">Repository</Label>
                <Input
                  id="github-repo"
                  type="text"
                  placeholder="username/repository"
                  onChange={(e) => setNewToken({
                    ...newToken,
                    configuration: { ...newToken.configuration, repository: e.target.value }
                  })}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createToken.isPending}
              >
                Save GitHub Token
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* AWS Integration */}
        <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>AWS Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="aws-access-key">Access Key ID</Label>
                <Input
                  id="aws-access-key"
                  type="text"
                  placeholder="AKIA..."
                />
              </div>
              <div>
                <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                <Input
                  id="aws-secret-key"
                  type="password"
                  placeholder="Enter secret key..."
                />
              </div>
              <div>
                <Label htmlFor="aws-region">Region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">us-east-1</SelectItem>
                    <SelectItem value="us-west-2">us-west-2</SelectItem>
                    <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Save AWS Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Prometheus Integration */}
        <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Prometheus Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="prometheus-url">Prometheus URL</Label>
                <Input
                  id="prometheus-url"
                  type="url"
                  placeholder="http://prometheus:9090"
                />
              </div>
              <div>
                <Label htmlFor="prometheus-token">Authentication Token (Optional)</Label>
                <Input
                  id="prometheus-token"
                  type="password"
                  placeholder="Bearer token..."
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Save Prometheus Config
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Slack Integration */}
        <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Slack Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="slack-webhook">Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/..."
                />
              </div>
              <div>
                <Label htmlFor="slack-channel">Channel</Label>
                <Input
                  id="slack-channel"
                  type="text"
                  placeholder="#devops"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Save Slack Integration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Existing Tokens */}
      {tokens && tokens.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Configured Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tokens.map((token: any) => {
                const Icon = serviceIcons[token.service as keyof typeof serviceIcons];
                return (
                  <div key={token.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{token.tokenName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{token.service}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteToken.mutate(token.id)}
                      disabled={deleteToken.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
