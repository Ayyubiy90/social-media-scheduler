declare module '../services/notificationService' {
    interface User {
        token: string;
    }

    export function loginUser(credentials: { email: string; password: string }): Promise<User>;
    export function registerUser(userData: { email: string; password: string }): Promise<User>;
    export function logoutUser(): void;
}
