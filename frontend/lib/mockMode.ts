export const isMockEnabled = (): boolean => {
  const value = process.env.NEXT_PUBLIC_USE_MOCKS;
  return value === '1' || value === 'true' || value === 'yes';
};

