export function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-ink-600/60 dark:text-parchment-200/50">
      © {new Date().getFullYear()} Agile Estimation. Built for teams who estimate together.
    </footer>
  );
}
