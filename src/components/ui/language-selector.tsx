"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export function LanguageSelector() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) {
      return;
    }

    const segments = pathname.split("/");

    if (segments[1] && ["en", "es"].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join("/");

    startTransition(() => {
      // Force a full page reload to ensure proper locale switching
      window.location.href = newPath;
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <span className="sm:hidden">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isPending}
            className={cn(
              "gap-2",
              language.code === currentLocale &&
                "bg-accent text-accent-foreground"
            )}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {language.code === currentLocale && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
