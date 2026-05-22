import {
    signIn, signUp, confirmSignUp,
    fetchAuthSession
} from 'aws-amplify/auth';

export async function login(email: string, password: string) {
    return signIn({ username: email, password });
}

export async function register(
    email: string,
    password: string,
    name: string
) {
    return signUp({
        username: name,
        password,
        options: {
            userAttributes: { email, name },
            autoSignIn: true,
        },
    });
}

export async function confirmEmail(
    username: string,
    code: string
) {
    return confirmSignUp({ username, confirmationCode: code });
}

export async function getAccessToken(): Promise<string> {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (!token) throw new Error('No hay sesión activa');
    return token;
}