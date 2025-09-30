"use client";

import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, Mail, Calendar, Edit, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileManagerProps {
  user: SupabaseUser;
}

export function ProfileManager({ user }: ProfileManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
          className="min-w-[100px]"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? tCommon("cancel") : tCommon("edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t("personalInformation")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t("profilePicture")}
                  </p>
                  <Button variant="outline" size="sm" className="mt-1">
                    {t("uploadPhoto")}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {t("fullName")}
                  </Label>
                  <Input
                    id="fullName"
                    value=""
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder={t("enterFullName")}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("email")}
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  User ID
                </Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {user?.id}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Created
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Sign In
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
