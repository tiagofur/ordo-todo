import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth-provider";
import { Button, Input, Label, Separator } from "@ordo-todo/ui";
import { CheckSquare, Chrome, Github } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const { login, signup, signInWithGoogle, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ email, password, username, name });
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading("google");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setOauthLoading("github");
    try {
      await signInWithGitHub();
      navigate("/dashboard");
    } catch (error) {
      console.error("GitHub sign in error:", error);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CheckSquare className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Ordo-Todo</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  pattern="[a-z0-9_-]+"
                  minLength={3}
                  required={!isLogin}
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números, guiones y guiones bajos. Mínimo 3 caracteres.
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Cargando..."
              : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </Button>
        </form>

        {/* OAuth Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === "google" ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Chrome className="h-4 w-4" />
            )}
            <span className="ml-2">
              {oauthLoading === "google" ? "Conectando..." : "Continuar con Google"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === "github" ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            <span className="ml-2">
              {oauthLoading === "github" ? "Conectando..." : "Continuar con GitHub"}
            </span>
          </Button>
        </div>

        {/* Toggle */}
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
