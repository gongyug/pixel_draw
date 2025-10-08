import { MarketingHeader } from '@/components/marketing-header';
import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 PixelDraw. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
              关于我们
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
              价格方案
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              隐私政策
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              服务条款
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
