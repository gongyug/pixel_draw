import { AuthLayout } from '@/components/auth-layout';
import { AuthPage } from '@/components/auth-page';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <AuthPage mode="signup" />
    </AuthLayout>
  );
}
