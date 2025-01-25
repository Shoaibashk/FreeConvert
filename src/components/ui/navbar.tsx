import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { SparklesText } from "./sparkles-text";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            {/* <a href="#" className="text-xl font-bold text-gray-800"> */}
            {/* FreeConvert */}
            <SparklesText text="FreeConvert" />
            {/* </a> */}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:space-x-8 md:ml-10">
            <a
              href="https://shoaibashk.github.io"
              className="text-gray-500 hover:text-gray-700"
            >
              By Shoaibashk
            </a>
            {/* <a href="#" className="text-gray-500 hover:text-gray-700">
              Features
            </a> */}
            {/* <a href="#" className="text-gray-500 hover:text-gray-700">
              Pricing
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Contact
            </a> */}
          </div>

          {/* Right Side (e.g., Login Button) */}
          {/* <div className="flex items-center">
            <Button className="bg-blue-500 hover:bg-blue-600">Login</Button>
          </div> */}

          {/* Mobile Menu (Dropdown) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Home</DropdownMenuItem>
                <DropdownMenuItem>Features</DropdownMenuItem>
                <DropdownMenuItem>Pricing</DropdownMenuItem>
                <DropdownMenuItem>Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
