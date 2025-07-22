import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user", {
      credentials: "include"
    })
      .then(async (res) => {
        if (res.status === 401) {
          setUser(null);
        } else {
          const userData = await res.json();
          setUser(userData);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
