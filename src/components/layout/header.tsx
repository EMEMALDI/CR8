"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Moon, Sun, Monitor, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />
    if (theme === "dark") return <Moon className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/pricing", label: "Pricing" },
    { href: "/creators", label: "For Creators" },
  ]

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-foreground transition-opacity hover:opacity-80"
        >
          CR8
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === link.href
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="transition-transform hover:scale-110"
          >
            {getThemeIcon()}
          </Button>

          {/* Auth Buttons - Unauthenticated */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Get Started</Button>
            </SignUpButton>
          </SignedOut>

          {/* User Button - Authenticated */}
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* Mobile Menu Dialog */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">CR8</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Auth Buttons */}
            <SignedOut>
              <div className="flex flex-col gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full">Get Started</Button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                    pathname === link.href
                      ? "bg-muted font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle */}
            <div className="mt-4 border-t pt-4">
              <Button
                variant="ghost"
                onClick={cycleTheme}
                className="w-full justify-start"
              >
                {getThemeIcon()}
                <span className="ml-2">
                  Theme: {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
