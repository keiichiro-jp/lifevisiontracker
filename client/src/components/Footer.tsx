import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} ライフビジョンアプリ. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy-policy" className="text-sm font-medium hover:underline">
            プライバシーポリシー
          </Link>
          <Link href="/terms-of-service" className="text-sm font-medium hover:underline">
            利用規約
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline">
            お問い合わせ
          </Link>
        </nav>
      </div>
    </footer>
  );
}