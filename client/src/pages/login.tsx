import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Lock, ShieldCheck } from "lucide-react";

export default function Login() {
  const handleGoogleLogin = () => {
    
    window.location.href = "http:///localhost:5000/auth/google";
    
  };

  const handleGithubLogin = () => {
     window.location.href = "http:///localhost:5000/auth/github";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to DevBoard
          </h1>
        </div>

        {/* Email/Password fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Sign in
          </Button>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
            or continue with
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleGoogleLogin}
            className="bg-white border hover:bg-gray-100 text-gray-800"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              className="h-5 w-5 mr-2"
            />
            Sign in with Google
          </Button>

          <Button
            onClick={handleGithubLogin}
            className="bg-black text-white hover:bg-gray-900"
          >
            <Github className="h-5 w-5 mr-2" />
            Sign in with GitHub
          </Button>
        </div>

        {/* Sign Up prompt */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
