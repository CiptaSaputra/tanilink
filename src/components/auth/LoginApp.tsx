/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import LoginPage from '@/components/auth/LoginPage';

export default function LoginApp() {
  const router = useRouter();

  return (
    <AuthProvider>
      <LoginPage onNavigateToRegister={() => router.push('/register')} />
    </AuthProvider>
  );
}
