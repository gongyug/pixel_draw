import { AuthLayout } from '@/components/auth-layout';
import { AuthPage } from '@/components/auth-page';

export default function SignInPage() {
  return (
    <AuthLayout>
      <AuthPage mode="signin" />
    </AuthLayout>
  );
}
