import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/features/auth/auth-form";
import { getDictionary } from "@/lib/i18n";

export default function LoginPage() {
  const dictionary = getDictionary();
  return <AuthCard title={dictionary.auth.loginTitle} description={dictionary.auth.loginDescription}><AuthForm mode="login" dictionary={dictionary} /></AuthCard>;
}
