import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

export default function Home() {
  const { data: pipelines = [] } = useQuery({
    queryKey: ['github-actions'],
    queryFn: async () => {
      const res = await fetch('/api/github/actions');
      if (!res.ok) throw new Error('Failed to fetch pipelines');
      return res.json();
    },
  });

  const { data: gcpResources = [] } = useQuery({
    queryKey: ['gcp-resources'],
    queryFn: async () => {
      const res = await fetch('/api/gcp/resources');
      if (!res.ok) throw new Error('Failed to fetch GCP resources');
      return res.json();
    },
  });

  const successfulBuilds = pipelines.filter((p: any) => p.conclusion === 'success').length;
  const failedBuilds = pipelines.filter((p: any) => p.conclusion === 'failure').length;
  const avgBuildTime =
    pipelines.reduce((acc: number, p: any) => acc + (p.duration || 0), 0) /
    (pipelines.length || 1);
  const monthlyCost = 342;

  const buildData = pipelines.slice(0, 7).map((p: any, index: number) => ({
    name: `#${index + 1}`,
    success: p.conclusion === 'success' ? 100 : 0,
  }));

  const resourceData = [
    {
      name: 'VMs',
      value: gcpResources.filter((r: any) => r.type === 'VM').length,
      color: '#3B82F6',
    },
    {
      name: 'GKE Clusters',
      value: gcpResources.filter((r: any) => r.type === 'GKE Cluster').length,
      color: '#10B981',
    },
    {
      name: 'Buckets',
      value: gcpResources.filter((r: any) => r.type === 'Bucket').length,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Builds</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{successfulBuilds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Builds</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{failedBuilds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Build Time</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.floor(avgBuildTime / 60)}m {Math.round(avgBuildTime % 60)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Cost</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">${monthlyCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Success Line Chart */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Build Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GCP Resource Pie Chart */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent GitHub Activity */}
      <Card className="metric-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelines?.slice(0, 3).map((pipeline: any) => (
              <div key={pipeline.html_url} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    pipeline.conclusion === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                    pipeline.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {pipeline.conclusion === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : pipeline.status === 'in_progress' ? (
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {pipeline.repo} #{pipeline.id} {pipeline.conclusion}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pipeline.branch} • {new Date(pipeline.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!pipelines || pipelines.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
