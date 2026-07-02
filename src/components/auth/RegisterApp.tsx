/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import RegisterPage from '@/components/auth/RegisterPage';

export default function RegisterApp() {
  const router = useRouter();

  return (
    <AuthProvider>
      <RegisterPage onNavigateToLogin={() => router.push('/login')} />
    </AuthProvider>
  );
}
