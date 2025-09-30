"use client";

import { Menu, X, User, CreditCard, LogOut, Home } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { createClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tApp = useTranslations("app");
  const { locale } = useParams();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  };

  const navigationItems = [
    {
      href: `/${locale}`,
      label: t("dashboard"),
      icon: Home,
    },
    {
      href: `/${locale}/transactions`,
      label: t("transactions"),
      icon: CreditCard,
    },
    {
      href: `/${locale}/profile`,
      label: t("profile"),
      icon: User,
    },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Link
              href={`/${locale}`}
              className="flex items-center space-x-2 group"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <span className="text-primary-foreground font-bold text-sm">
                  F
                </span>
              </div>
              <span className="font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                {tApp("name")}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4 transition-transform duration-200" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground animate-fadeIn">
                {tCommon("welcome")}, {userName || "User"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {tAuth("signOut")}
              </Button>
            </div>

            <LanguageSelector />
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden transition-all duration-200 hover:scale-110"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu with improved animations */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={toggleMenu}
          />

          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-2xl animate-slideInRight">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-foreground">
                  {tApp("name")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 px-6 py-6">
                <div className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleMenu}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 animate-slideUp",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-foreground hover:bg-accent"
                        )}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div
                className="px-6 py-6 border-t animate-slideUp"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {tCommon("welcome")}, {userName || "User"}
                  </span>
                  <LanguageSelector />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start transition-all duration-200 hover:scale-105"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {tAuth("signOut")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
