import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckSquare, Mail, Lock, User, Github, Chrome, ArrowRight, 
  Sparkles, Check, X, Eye, EyeOff 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../components/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Label, Separator } from "@ordo-todo/ui";

// Define interface for password checks
interface PasswordChecks {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
}

export function Auth() {
  const navigate = useNavigate();
  const { login, signup, signInWithGoogle, signInWithGitHub } = useAuth();
  
  // State
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false
  });

  // Reset form when switching modes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Password Strength Logic (Copied from Web)
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { 
      score: 0, 
      label: "", 
      color: "", 
      textColor: "", 
      checks: { length: false, lowercase: false, uppercase: false, number: false, special: false } as PasswordChecks 
    };

    let score = 0;
    const checks: PasswordChecks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    score += checks.length ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.number ? 1 : 0;
    score += checks.special ? 1 : 0;

    if (score <= 2) return { score, label: "Débil", color: "bg-red-500", textColor: "text-red-600", checks };
    if (score <= 3) return { score, label: "Media", color: "bg-yellow-500", textColor: "text-yellow-600", checks };
    if (score <= 4) return { score, label: "Buena", color: "bg-cyan-500", textColor: "text-cyan-600", checks };
    return { score, label: "Excelente", color: "bg-green-500", textColor: "text-green-600", checks };
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ 
            email: formData.email, 
            password: formData.password 
        });
        toast.success("Sesión iniciada exitosamente");
      } else {
        // Register validations
        if (formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }
        if (passwordStrength.score < 2) {
            toast.error("La contraseña es muy débil");
            setIsLoading(false);
            return;
        }

        await signup({ 
            email: formData.email, 
            password: formData.password, 
            username: formData.username, 
            name: formData.name 
        });
        toast.success("Cuenta creada exitosamente");
      }
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error?.message || "Error de autenticación. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error al conectar con Google");
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error al conectar con GitHub");
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.password && formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-purple-500/5 to-cyan-500/5 p-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute left-10 top-20 h-32 w-32 rotate-12 rounded-3xl bg-purple-500/10 blur-3xl animate-pulse" />
      <div className="absolute right-20 top-40 h-40 w-40 -rotate-12 rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-700" />
      <div className="absolute bottom-20 left-1/4 h-36 w-36 rotate-6 rounded-2xl bg-pink-500/10 blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`group mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 ${isLogin ? 'bg-purple-500 shadow-purple-500/30' : 'bg-cyan-500 shadow-cyan-500/30'}`}
          >
            <CheckSquare className="h-9 w-9 text-white" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? "Bienvenido de nuevo" : "Crear Cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin 
                ? "Inicia sesión para continuar con Ordo" 
                : "Comienza a organizar tus tareas hoy mismo"}
          </p>
        </div>

        {/* Main Form Card */}
        <motion.div
          layout
          className="overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-xl backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
                {!isLogin && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                        </div>

                         {/* Username Input */}
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Nombre de Usuario</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    placeholder="usuario123"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {!isLogin && formData.password && (
                <div className="mt-2 space-y-2 rounded-lg bg-muted/30 p-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                        </div>
                        <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                    </div>
                </div>
              )}
            </div>

            <AnimatePresence mode="popLayout">
                {!isLogin && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                         <label className="text-sm font-medium text-foreground">Confirmar Contraseña</label>
                         <div className="relative group">
                            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${passwordsMatch ? "text-green-500" : passwordsMismatch ? "text-red-500" : "text-orange-500"}`}>
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required={!isLogin}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={`h-12 w-full rounded-xl border bg-background pl-11 pr-11 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    passwordsMatch 
                                        ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" 
                                        : "border-input focus:border-orange-500 focus:ring-orange-500/20"
                                }`}
                                placeholder="Repite tu contraseña"
                            />
                             <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remember Me (Login Only) */}
            {isLogin && (
                 <div className="flex items-center space-x-2">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                        className="h-4 w-4 rounded border-input text-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">
                        Recordarme
                    </label>
                </div>
            )}

            <Button 
                type="submit" 
                className={`w-full h-12 text-lg font-medium transition-all duration-300 ${
                    isLogin 
                        ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30' 
                        : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30'
                } text-white shadow-lg  hover:scale-[1.02]`}
                disabled={isLoading}
            >
              {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                 <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    <ArrowRight className="h-4 w-4" />
                 </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">O continúa con</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600"
            >
              <Chrome className="h-5 w-5" />
              Google
            </button>
            <button
               onClick={handleGitHubSignIn}
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600"
            >
              <Github className="h-5 w-5" />
              GitHub
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
               {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              <button
                type="button"
                onClick={toggleMode}
                className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                    isLogin ? 'text-purple-500 hover:text-purple-600' : 'text-cyan-500 hover:text-cyan-600'
                }`}
              >
                {isLogin ? "Regístrate gratis" : "Inicia sesión"}
                {isLogin ? <Sparkles className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
