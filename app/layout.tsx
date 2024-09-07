
import type { Metadata,Viewport } from 'next';
import { ThemeProvider } from "./../components/theme-provider"
import Link from 'next/link'
import '@/app/globals.css'

export const viewport :Viewport= {
    themeColor:  [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
};

export const metadata: Metadata = {
    title: "",
    description:"",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
}
export default function RootLayout({ children }: any) {
    return (
        <html lang="en" suppressHydrationWarning>

        <head />

        <body>
        <ThemeProvider attribute="class" defaultTheme="light" >
            <main className="">{children}</main>
            <Link href="/map">
                <h3>查看地圖</h3>
            </Link>
        </ThemeProvider>
        </body>
        </html>
    )
}
