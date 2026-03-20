// lib/auth.ts
export function login(token: string) {
	localStorage.setItem("token", token);
	// Set cookie for middleware (1 week)
	document.cookie = `auth-token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function logout() {
	localStorage.removeItem("token");
	// Clear cookie
	document.cookie = `auth-token=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getToken() {
	return localStorage.getItem("token");
}

export function isAuthenticated() {
	return !!localStorage.getItem("token");
}
