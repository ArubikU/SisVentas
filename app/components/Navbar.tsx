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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { BarChart2, Globe, Menu, Moon, Sun, User, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Lang } from "./Lang"

const roleColors = {
  basic: "text-green-500",
  advanced: "text-blue-500",
  administrator: "text-red-500",
}

export default function Navbar() {
  const { user, logout , api, changePassword} = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme()
  const { toast } = useToast()
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleLogout = () => {
    logout()
    toast({
      title: <Lang text="logoutSuccessful" />,
      description: <Lang text="logoutSuccessfulMessage" />,
    })
  }

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: <Lang text="passwordMismatch" />,
        description: <Lang text="passwordMismatchMessage" />,
        variant: "destructive",
      })
      return
    }
    try {
      api.changePassword("self", newPassword)
      toast({
        title: <Lang text="passwordChangeSuccessful" />,
        description: <Lang text="passwordChangeSuccessfulMessage" />,
      })
      setIsPasswordChangeOpen(false)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({
        title: <Lang text="passwordChangeError" />,
        description: <Lang text="passwordChangeErrorMessage" />,
        variant: "destructive",
      })
    }
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
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className={`text-xs leading-none ${roleColors[user.tier]}`}>
                        <Lang text={user.tier as TranslationKey} />
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsPasswordChangeOpen(true)}>
                    <Lang text="changePassword" />
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
                        <Lang text="welcome" />, {user.email}
                      </p>
                      <p className={`text-xs leading-none ${roleColors[user.tier]}`}>
                        <Lang text={user.tier as TranslationKey} />
                      </p>
                      <Button onClick={() => setIsPasswordChangeOpen(true)} className="w-full">
                        <Lang text="changePassword" />
                      </Button>
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
      <Sheet open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <Lang text="changePassword" />
            </SheetTitle>
            <SheetDescription>
              <Lang text="changePasswordDescription" />
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                <Lang text="newPassword" />
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                <Lang text="confirmPassword" />
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <SheetFooter>
              <Button type="submit">
                <Lang text="changePassword" />
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

