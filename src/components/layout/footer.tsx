import Link from "next/link";
import { Zap, Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { href: "#features", label: "Features" },
    { href: "#templates", label: "Templates" },
    { href: "#pricing", label: "Pricing" },
    { href: "/changelog", label: "Changelog" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "/docs", label: "Documentation" },
    { href: "/tutorials", label: "Tutorials" },
    { href: "/examples", label: "Examples" },
    { href: "/support", label: "Support" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Rapid<span className="text-violet-600">MVP</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
              Build production-ready MVPs in minutes with AI. From idea to deployment, faster than ever.
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                href="https://twitter.com"
                className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Product
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Resources
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} RapidMVP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
