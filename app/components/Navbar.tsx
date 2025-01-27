"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { BarChart2, Globe, Menu, Moon, Settings, Sun, User, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Lang } from "./Lang"

const roleColors = {
  basic: "text-green-500",
  advanced: "text-blue-500",
  administrator: "text-red-500",
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    toast({
      title: <Lang text="logoutSuccessful" />,
      description: <Lang text="logoutSuccessfulMessage" />,
    })
  }

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0">
      <Link href="/" className="text-foreground hover:text-primary transition-colors">
        <Lang text="home" />
      </Link>
      <Link href="/bills" className="text-foreground hover:text-primary transition-colors">
        <Lang text="receipts" />
      </Link>
      <Link href="/deposits" className="text-foreground hover:text-primary transition-colors">
        <Lang text="deposits" />
      </Link>
      <Link href="/clients" className="text-foreground hover:text-primary transition-colors">
        <Lang text="clients" />
      </Link>
      <Link href="/products" className="text-foreground hover:text-primary transition-colors">
        <Lang text="products" />
      </Link>
      <Link href="/statistics" className="text-foreground hover:text-primary transition-colors flex items-center">
        <BarChart2 className="h-4 w-4 mr-1" />
        <Lang text="statistics" />
      </Link>
      {user && user.tier === "administrator" && (
        <Link href="/usuarios" className="text-foreground hover:text-primary transition-colors flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <Lang text="users" />
        </Link>
      )}
    </div>
  )

  return (
    <nav className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-primary">SisVentas</span>
          </div>
          <div className="hidden md:flex items-center">
            <NavLinks />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "Dark Mode" : "Light Mode"}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.userName}</p>
                      <p className={`text-xs leading-none ${roleColors[user.tier]}`}>
                        <Lang text={user.tier as TranslationKey} />
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <Lang text="settings" />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Lang text="profile" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <Lang text="logout" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost">
                  <Lang text="login" />
                </Button>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <Lang text="menu" />
                  </SheetTitle>
                  <SheetDescription>
                    <Lang text="navigationAndUserOptions" />
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <nav className="flex flex-col space-y-4">
                    <NavLinks />
                  </nav>
                  <div className="h-px bg-border" />
                  {user ? (
                    <div className="space-y-4">
                      <p className="text-foreground">
                        <Lang text="welcome" />, {user.userName}
                      </p>
                      <p className={`text-xs leading-none ${roleColors[user.tier]}`}>
                        <Lang text={user.tier as TranslationKey} />
                      </p>
                      <Button onClick={handleLogout} className="w-full">
                        <Lang text="logout" />
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full">
                        <Lang text="login" />
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

