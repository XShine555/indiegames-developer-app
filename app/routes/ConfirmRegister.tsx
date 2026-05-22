import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import Card from "@components/Card";
import { Input } from "@components/Input";
import PrimaryButton from "@components/PrimaryButton";
import { KeyRound } from "lucide-react";
import { confirmEmail } from "@auth/AuthService";
import type { SubmitEvent } from "react";

function parseAuthError(err: unknown): string {
    if (err instanceof Error) {
        const map: Record<string, string> = {
            CodeMismatchException: "El código introducido no es correcto",
            ExpiredCodeException: "El código ha expirado, solicita uno nuevo",
            TooManyRequestsException: "Demasiados intentos. Espera un momento",
            LimitExceededException: "Has superado el límite de intentos",
        };
        return map[err.name] ?? err.message;
    }
    return "Error inesperado";
}

export default function ConfirmRegister() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const email: string | null = state?.email;
    const username: string | null = state?.username;

    useEffect(() => {
        if (!email || !username) {
            navigate("/register", { replace: true });
        }
    }, [email, username, navigate]);

    if (!email || !username) return null;

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!code.trim()) {
            setError("El código es obligatorio");
            return;
        }

        setIsPending(true);
        try {
            await confirmEmail(username, code);
            navigate("/login", { replace: true });
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
                    <h2>Confirmar cuenta</h2>
                    <h5>
                        Te hemos enviado un código de verificación a{" "}
                        <span className="font-medium">{email}</span>
                    </h5>
                </div>

                <div className="flex flex-col gap-4">
                    <Input.Root
                        id="code"
                        type="text"
                        value={code}
                        onChange={setCode}
                        variant="inside card"
                    >
                        <Input.Label>Código de verificación</Input.Label>
                        <Input.Field placeholder="Ingresa el código de 6 dígitos" icon={KeyRound} />
                    </Input.Root>

                    {error && (
                        <p role="alert" className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <PrimaryButton type="submit" disabled={isPending}>
                        {isPending ? "Verificando..." : "Confirmar cuenta"}
                    </PrimaryButton>

                    <div className="flex flex-col gap-3">
                        <p className="text-sm">
                            ¿No recibiste el código?{" "}
                            <Link to="/register" className="link">Volver al registro</Link>
                        </p>
                    </div>
                </div>
            </Card>
        </form>
    );
}