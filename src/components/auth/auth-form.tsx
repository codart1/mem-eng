"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-provider";
import { useT } from "@/lib/i18n";

type Mode = "signin" | "signup";

/** Where to land after a successful sign-in. */
const POST_AUTH_REDIRECT = "/dashboard";

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useT();
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);

  const a = t.account;

  function validate(): string | null {
    if (!z.string().email().safeParse(email.trim()).success) return a.emailInvalid;
    if (password.length < 8) return a.passwordMin;
    if (mode === "signup" && password !== confirm) return a.passwordMismatch;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    setPending(true);
    try {
      if (mode === "signup") {
        const res = await signUp(email.trim(), password);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.needsConfirmation) {
          setConfirmation(true);
          return;
        }
        toast.success(a.accountCreated);
        router.push(POST_AUTH_REDIRECT);
      } else {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          setError(res.error);
          return;
        }
        toast.success(a.welcomeBack);
        router.push(POST_AUTH_REDIRECT);
      }
    } finally {
      setPending(false);
    }
  }

  if (confirmation) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-brand/10 text-brand mx-auto grid size-12 place-items-center rounded-full">
          <MailCheck className="size-6" />
        </div>
        <h1 className="font-serif text-2xl font-semibold">{a.confirmTitle}</h1>
        <p className="text-muted-foreground text-sm">
          {a.confirmBody.replace("{email}", email.trim())}
        </p>
        <Button variant="outline" className="w-full" render={<Link href="/login" />}>
          {a.signIn}
        </Button>
      </div>
    );
  }

  const submitting = mode === "signup" ? a.creatingAccount : a.signingIn;
  const submitLabel = mode === "signup" ? a.createAccount : a.signIn;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="font-serif text-2xl font-semibold">
          {mode === "signup" ? a.signUpTitle : a.signInTitle}
        </h1>
        <p className="text-muted-foreground text-sm">
          {mode === "signup" ? a.signUpSubtitle : a.signInSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">{a.email}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={a.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{a.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={a.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirm">{a.confirmPassword}</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={pending}
              required
            />
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? submitting : submitLabel}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        {mode === "signup" ? a.haveAccount : a.noAccount}{" "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="text-brand font-medium hover:underline"
        >
          {mode === "signup" ? a.signIn : a.createAccount}
        </Link>
      </p>
    </div>
  );
}
