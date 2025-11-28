import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Download, Github, Monitor, Menu } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { usePWA } from "@/hooks/usePWA";

export default function Navbar() {
  const { theme, setTheme, isDark } = useTheme();
  const { isInstallable, installApp } = usePWA();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 transform -rotate-2 hover:rotate-0 transition-transform">
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl sketch-border shadow-sm">
              F
            </div>
            <span className="text-2xl font-bold tracking-tight">
              FreeConvert
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <a
              href="https://github.com/Shoaibashk/FreeConvert"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold hover:text-primary transition-colors flex items-center gap-2 transform hover:-translate-y-1 transition-transform"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sketch-border hover:bg-secondary hover:text-secondary-foreground transition-colors"
                >
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="sketch-border">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="font-bold"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {theme === "light" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="font-bold"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {theme === "dark" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="font-bold"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {theme === "system" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Install PWA Button */}
            {isInstallable && (
              <Button
                onClick={installApp}
                size="sm"
                className="sketch-button bg-secondary text-secondary-foreground"
              >
                <Download size={18} className="mr-2" />
                Install App
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle for Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sketch-border"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </Button>

            {/* Mobile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sketch-border">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sketch-border">
                <DropdownMenuItem asChild>
                  <a
                    href="https://github.com/Shoaibashk/FreeConvert"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center font-bold"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </DropdownMenuItem>
                {isInstallable && (
                  <DropdownMenuItem onClick={installApp} className="font-bold">
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
