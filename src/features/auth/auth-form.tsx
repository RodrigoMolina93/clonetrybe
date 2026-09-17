"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/features/auth/actions";
import { initialActionState } from "@/features/auth/types";
import type { Dictionary } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { mode: "login" | "register"; dictionary: Dictionary };

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-destructive" role="alert">{errors[0]}</p> : null;
}

export function AuthForm({ mode, dictionary }: Props) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? login : register, initialActionState);
  const { auth, common } = dictionary;
  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{common.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email)} />
        <FieldError errors={state.fieldErrors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{common.password}</Label>
        <Input id="password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required aria-invalid={Boolean(state.fieldErrors?.password)} />
        {!isLogin && <p className="text-sm text-muted-foreground">{auth.passwordHint}</p>}
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      {state.message && <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? (isLogin ? auth.loginPending : auth.registerPending) : (isLogin ? auth.loginAction : auth.registerAction)}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? auth.noAccount : auth.hasAccount}{" "}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href={isLogin ? "/registro" : "/ingresar"}>
          {isLogin ? auth.registerLink : auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
