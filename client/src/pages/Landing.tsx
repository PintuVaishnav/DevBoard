import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
            <Code className="text-white text-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome to DevBoard</h2>
          <p className="mt-2 text-slate-300">Your unified Developer Ops Dashboard</p>
        </div>
        
        <Card className="bg-white dark:bg-gray-800 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Sign in to continue
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
