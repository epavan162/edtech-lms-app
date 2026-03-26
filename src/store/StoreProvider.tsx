import React, { type ReactNode } from 'react';
import { AuthProvider } from './auth';
import { CourseStoreProvider } from './courses';

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CourseStoreProvider>{children}</CourseStoreProvider>
    </AuthProvider>
  );
}
