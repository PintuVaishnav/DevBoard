import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Generate mock cost data
const generateCostData = () => {
  const services = ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const monthlyCosts = months.map(month => ({
    month,
    cost: Math.floor(Math.random() * 500) + 200
  }));
  
  const serviceCosts = services.map(service => ({
    service,
    cost: Math.floor(Math.random() * 200) + 50
  }));
  
  return { monthlyCosts, serviceCosts };
};

export default function Costs() {
  const { data: infraCosts, isLoading } = useQuery({
    queryKey: ['/api/infra-costs'],
  });

  const { monthlyCosts, serviceCosts } = generateCostData();
  const totalCost = serviceCosts.reduce((sum, item) => sum + item.cost, 0);
  const lastMonthCost = monthlyCosts[monthlyCosts.length - 2]?.cost || 0;
  const currentMonthCost = monthlyCosts[monthlyCosts.length - 1]?.cost || 0;
  const costChange = ((currentMonthCost - lastMonthCost) / lastMonthCost) * 100;

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Costs</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor and analyze your cloud infrastructure expenses</p>
      </div>
      
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Total</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${totalCost.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Change vs Last Month</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {costChange > 0 ? '+' : ''}{costChange.toFixed(1)}%
                  </p>
                  <Badge className={`status-badge ${costChange > 0 ? 'status-failed' : 'status-success'}`}>
                    {costChange > 0 ? 'Up' : 'Down'}
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                {costChange > 0 ? (
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Service</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {serviceCosts.sort((a, b) => b.cost - a.cost)[0]?.service || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${serviceCosts.sort((a, b) => b.cost - a.cost)[0]?.cost || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <BarChart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Bar dataKey="cost" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
