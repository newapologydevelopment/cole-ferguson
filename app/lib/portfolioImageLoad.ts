export function getPortfolioImageLoadProps(isPrimary: boolean, isActive: boolean) {
  if (isPrimary) {
    return {
      priority: isActive,
      loading: (isActive ? 'eager' : 'lazy') as 'eager' | 'lazy',
      fetchPriority: (isActive ? 'high' : 'low') as 'high' | 'low',
    };
  }

  return {
    priority: false,
    loading: (isActive ? 'eager' : 'lazy') as 'eager' | 'lazy',
    fetchPriority: (isActive ? 'high' : 'low') as 'high' | 'low',
  };
}
