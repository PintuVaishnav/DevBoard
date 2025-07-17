import { useState, useCallback } from 'react';

export type DashboardPage = 'overview' | 'pipelines' | 'health' | 'features' | 'releases' | 'costs' | 'tokens';

export function useDashboard() {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('overview');

  const navigateToPage = useCallback((page: DashboardPage) => {
    setCurrentPage(page);
  }, []);

  const getPageTitle = useCallback((page: DashboardPage) => {
    const titles = {
      'overview': 'Dashboard Overview',
      'pipelines': 'CI/CD Pipelines', 
      'health': 'App Health Monitoring',
      'features': 'Feature Flags',
      'releases': 'Release Notes',
      'costs': 'Infrastructure Costs',
      'tokens': 'API Tokens'
    };
    return titles[page];
  }, []);

  return {
    currentPage,
    navigateToPage,
    getPageTitle,
  };
}
