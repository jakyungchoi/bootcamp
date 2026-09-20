type FooterProps = {
  siteName: string;
  description: string;
};

export function Footer({ siteName, description }: FooterProps) {
  return (
    <footer className="border-t border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-neutral-500 dark:text-neutral-400">
        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{siteName}</p>
        <p className="mt-2 max-w-xl">{description}</p>
        <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} Wanted Lab, Inc.{" "}
          <a href="/admin" className="underline decoration-dotted underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300">
            관리자 페이지
          </a>
        </p>
      </div>
    </footer>
  );
}
