import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Global Business Automation Suite - Automação Empresarial Completa',
  description: 'Plataforma completa com 17+ serviços premium para acelerar seu negócio digital. LLCs, TikTok Shops, Proxies, IA Marketing e muito mais.',
  keywords: 'automação empresarial, LLC EUA, TikTok Shop, proxies, marketing digital, IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
