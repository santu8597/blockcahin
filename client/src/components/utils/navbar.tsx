"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/utils/mode-toggle"
import { ChevronDown, Droplet, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)

  const toggleMobileSubmenu = (menu: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === menu ? null : menu)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <Droplet className="h-6 w-6 text-primary" />
            <span className="font-rubik text-xl font-bold">Crimson</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium md:flex md:ml-4">
          <Link href="/camps" className="transition-colors hover:text-primary duration-200">
            Blood Camps
          </Link>

          {/* Dashboard Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-1 transition-colors hover:text-primary duration-200">
              <span>Dashboard</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
              <div className="py-1 rounded-md bg-popover">
                <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary">
                  User Dashboard
                </Link>
                <Link href="/hospital-dashboard" className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary">
                  Hospital Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Organ Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-1 transition-colors hover:text-primary duration-200">
              <span>Organ</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
              <div className="py-1 rounded-md bg-popover">
                <Link href="/organ" className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary">
                  Organ Requests
                </Link>
                <Link href="/org-donor" className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary">
                  Organ Donor
                </Link>
                <Link href="/org-hos-reg" className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary">
                  Organ Host Register
                </Link>
              </div>
            </div>
          </div>

          <Link href="/createcamp" className="transition-colors hover:text-primary duration-200">
            Create Camp
          </Link>

          <Link href="/mint-nft" className="transition-colors hover:text-primary duration-200">
            Mint NFT
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 top-14 w-full bg-background md:hidden border-b">
            <div className="container py-4 space-y-4">
              <Link href="/camps" className="block transition-colors hover:text-primary duration-200">
                Blood Camps
              </Link>

              {/* Mobile Dashboard Dropdown */}
              <div>
                <button
                  onClick={() => toggleMobileSubmenu("dashboard")}
                  className="flex items-center justify-between w-full transition-colors hover:text-primary duration-200"
                >
                  <span>Dashboard</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileExpandedMenu === "dashboard" ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileExpandedMenu === "dashboard" && (
                  <div className="pl-4 mt-2 space-y-2 border-l border-border ml-2">
                    <Link href="/dashboard" className="block transition-colors hover:text-primary duration-200">
                      User Dashboard
                    </Link>
                    <Link
                      href="/hospital-dashboard"
                      className="block transition-colors hover:text-primary duration-200"
                    >
                      Hospital Dashboard
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Organ Dropdown */}
              <div>
                <button
                  onClick={() => toggleMobileSubmenu("organ")}
                  className="flex items-center justify-between w-full transition-colors hover:text-primary duration-200"
                >
                  <span>Organ</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileExpandedMenu === "organ" ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileExpandedMenu === "organ" && (
                  <div className="pl-4 mt-2 space-y-2 border-l border-border ml-2">
                    <Link href="/organ" className="block transition-colors hover:text-primary duration-200">
                      Organ Requests
                    </Link>
                    <Link href="/org-donor" className="block transition-colors hover:text-primary duration-200">
                      Organ Donor
                    </Link>
                    <Link href="/org-hos-reg" className="block transition-colors hover:text-primary duration-200">
                      Organ Host Register
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/createcamp" className="block transition-colors hover:text-primary duration-200">
                Create Camp
              </Link>

              <Link href="/mint-nft" className="block transition-colors hover:text-primary duration-200">
                Mint NFT
              </Link>
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "avatar",
            }}
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  )
}

