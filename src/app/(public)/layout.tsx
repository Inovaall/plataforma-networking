// src/app/(public)/layout.tsx
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header simples para páginas públicas */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">
                Plataforma de Networking
              </h1>
            </a>
            <nav className="flex gap-4">
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Início
              </a>
              <a
                href="/aplicar"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Candidatar-se
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Plataforma de Networking. Teste Técnico - Desenvolvedor Fullstack.
          </p>
        </div>
      </footer>
    </div>
  );
}