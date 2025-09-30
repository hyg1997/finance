"use client";

import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { gradientStyles, cn } from "@/lib/styles";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const t = useTranslations("auth");
  const tError = useTranslations("errors");

  const handleAuth = async (
    e: React.FormEvent<HTMLFormElement>,
    action: "sign-in" | "sign-up"
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } =
        action === "sign-in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      } else {
        if (action === "sign-in") {
          toast({
            variant: "success",
            title: t("success"),
            description: t("signInSuccess"),
          });
          router.push("/");
        } else {
          toast({
            variant: "success",
            title: t("accountCreated"),
            description: t("checkEmailConfirm"),
          });
          setView("sign-in");
        }
      }
    } catch {
      toast({
        variant: "destructive",
        title: tError("title"),
        description: tError("unexpectedError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: t("emailRequired"),
        description: t("enterEmailFirst"),
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        toast({
          variant: "destructive",
          title: tError("title"),
          description: error.message,
        });
      } else {
        toast({
          variant: "success",
          title: t("magicLinkSent"),
          description: t("checkEmailMagicLink"),
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: tError("title"),
        description: t("magicLinkFailed"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        gradientStyles.page
      )}
    >
      <div className="w-full">
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-8">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg",
                gradientStyles.iconPrimary
              )}
            >
              <span className="text-2xl font-bold text-primary-foreground">
                F
              </span>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {view === "sign-in" ? t("welcomeBack") : t("createAccount")}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {view === "sign-in" ? t("getStarted") : t("getStarted")}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={(e) => handleAuth(e, view)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("enterEmail")}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                    required
                    aria-describedby="email-error"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("enterPassword")}
                    className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                    required
                    aria-describedby="password-error"
                    autoComplete={
                      view === "sign-up" ? "new-password" : "current-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {view === "sign-in" ? t("signingIn") : t("signingUp")}
                  </>
                ) : view === "sign-in" ? (
                  t("signIn")
                ) : (
                  t("signUp")
                )}
              </Button>
            </form>

            {view === "sign-in" && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {view === "sign-in" && (
              <Button
                onClick={handleMagicLink}
                variant="outline"
                className="w-full h-11 transition-all duration-200 hover:bg-muted/50"
                disabled={isLoading}
                aria-label="Send magic link to email for passwordless login"
              >
                {isLoading ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Magic Link Login
              </Button>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {view === "sign-in" ? (
                  <>
                    {t("dontHaveAccount")}{" "}
                    <Button
                      variant="link"
                      onClick={() => setView("sign-up")}
                      className="px-0 h-auto font-medium text-primary hover:text-primary/80"
                      disabled={isLoading}
                    >
                      {t("signUpHere")}
                    </Button>
                  </>
                ) : (
                  <>
                    {t("alreadyHaveAccount")}{" "}
                    <Button
                      variant="link"
                      onClick={() => setView("sign-in")}
                      className="px-0 h-auto font-medium text-primary hover:text-primary/80"
                      disabled={isLoading}
                    >
                      {t("signInHere")}
                    </Button>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
