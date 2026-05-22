import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import Card from "@components/Card";
import { Input } from "@components/Input";
import PrimaryButton from "@components/PrimaryButton";
import { User, Lock, Mail } from "lucide-react";
import { register } from "@auth/AuthService";

function parseAuthError(err: unknown): string {
    if (err instanceof Error) {
        const map: Record<string, string> = {
            UsernameExistsException: "Ya existe una cuenta con ese correo",
            InvalidPasswordException: "La contraseña no cumple los requisitos de seguridad",
            InvalidParameterException: "Algún campo tiene un formato incorrecto",
            TooManyRequestsException: "Demasiados intentos. Espera un momento",
        };
        return map[err.name] ?? err.message;
    }
    return "Error inesperado";
}

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("El correo electrónico es obligatorio");
            return;
        }
        if (!user.trim()) {
            setError("El usuario es obligatorio");
            return;
        }
        if (/\s/.test(user)) {
            setError("El usuario no puede contener espacios");
            return;
        }
        if (!password.trim()) {
            setError("La contraseña es obligatoria");
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setIsPending(true);
        try {
            await register(email, password, user);
            navigate("/confirm-register", { state: { email, username: user }, replace: true });
        } catch (err) {
            setError(parseAuthError(err));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form
            className="min-h-screen max-w-xl m-auto flex items-center"
            onSubmit={handleSubmit}
        >
            <Card>
                <div className="mb-6">
                    <h2>Registrarse</h2>
                    <h5>Crea tu cuenta para comenzar a desarrollar tus juegos Indies</h5>
                </div>

                <div className="flex flex-col gap-4">
                    <Input.Root
                        id="email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        variant="inside card"
                    >
                        <Input.Label>Correo Electrónico</Input.Label>
                        <Input.Field placeholder="Ingresa tu correo electrónico" icon={Mail} />
                    </Input.Root>

                    <Input.Root
                        id="user"
                        type="text"
                        value={user}
                        onChange={setUser}
                        variant="inside card"
                    >
                        <Input.Label>Usuario</Input.Label>
                        <Input.Field placeholder="Ingresa tu nombre de usuario" icon={User} />
                    </Input.Root>

                    <Input.Root
                        id="password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        variant="inside card"
                    >
                        <Input.Label>Contraseña</Input.Label>
                        <Input.Field placeholder="Ingresa tu contraseña" icon={Lock} />
                    </Input.Root>

                    <Input.Root
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        variant="inside card"
                    >
                        <Input.Label>Confirmar Contraseña</Input.Label>
                        <Input.Field placeholder="Escribe tu contraseña de nuevo" icon={Lock} />
                    </Input.Root>

                    {error && (
                        <p role="alert" className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <PrimaryButton type="submit" disabled={isPending}>
                        {isPending ? "Creando cuenta..." : "Registrarse"}
                    </PrimaryButton>

                    <div className="flex flex-col gap-3">
                        <p className="text-sm">
                            Ya tienes una cuenta?{" "}
                            <Link to="/login" className="link">Iniciar Sesión</Link>
                        </p>
                    </div>
                </div>
            </Card>
        </form>
    );
}