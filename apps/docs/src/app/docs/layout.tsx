import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    section: "Getting Started",
    items: [
      { href: "/docs/getting-started", label: "Introduction" },
      { href: "/docs/getting-started/installation", label: "Installation" },
    ],
  },
  {
    section: "API Reference",
    items: [
      { href: "/docs/api-reference", label: "Overview" },
      { href: "/docs/api-reference/embeddings", label: "Embeddings" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <nav className="space-y-1">
      {navigation.map((section) => (
        <div key={section.section} className="mb-4">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {section.section}
          </h5>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-sm block py-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
            <NavContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 p-6 hidden md:block">
        <NavContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8 md:p-12">{children}</div>
    </div>
  );
}
