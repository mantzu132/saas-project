"use client";

import { NavButton } from "@/components/nav-button";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { useMedia } from "react-use";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useState } from "react";
import { Menu } from "lucide-react";

const routes = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/accounts", label: "Accounts" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
];

export const Navigation = () => {
  const router = useRouter();
  const isMobile = useMedia("(max-width: 1024px)", false);
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();

  const handleClick = (href) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={
              "font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:outline-none text-white transition"
            }
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === pathName ? "secondary" : "ghost"}
                onClick={() => handleClick(route.href)}
                className="w-full justify-start"
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={pathName === route.href}
        />
      ))}
    </nav>
  );
};
