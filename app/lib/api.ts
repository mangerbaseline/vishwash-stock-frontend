// lib/api.ts

export interface UserData {
  location: string;
  website: string;
  skills: never[];
  joinDate: string;
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  photo?: string;
  fullName?: string;
  phone?: string;
  bio?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Pending' | 'Completed' | 'Canceled';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  category: string;
  assignee: {
    name: string;
    avatar?: string;
    email?: string;
  };
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

// Task API Functions
export async function getTasks(token: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(token: string, taskData: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(token: string, taskId: string, taskData: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(token: string, taskId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}


export async function signin(email: string, password: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const endpoint = `${BASE_URL}/api/auth/Authentication/signin`;

  console.log("📤 API: Sending signin request to:", endpoint);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    console.log("📥 API: Response status:", res.status);

    if (!res.ok) {
      throw new Error(`Signin failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("📥 API: Response data:", data);

    if (data.token) {
      console.log("✅ Token received, storing...");

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      document.cookie = `auth-token=${data.token}; path=/; max-age=86400; samesite=lax`;
    }

    return data;
  } catch (error: any) {
    console.error("❌ API: Fetch error:", error);
    throw error;
  }
}


export const getStocks = async () => {
  const res = await fetch(`${API_BASE_URL}/stocks`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Failed to fetch stocks')
  return res.json()
}

export const getStock = async (symbol: string) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${symbol}`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Failed to fetch stock')
  return res.json()
}

export const getStockHistory = async (symbol: string) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}



export async function signup({ username, email, password, phone }: { username: string; email: string; password: string; phone: string }) {
  console.log("📤 API: Sending signup request to:", `${API_BASE_URL}/auth/register`);
  console.log("📤 API: Request body:", { username, email, password, phone }); // Added phone to log

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username,
        email,
        password,
        phone  // ✅ Now sending phone number!
      }),
      signal: controller.signal // Add abort signal
    });

    clearTimeout(timeoutId); // Clear timeout on success

    console.log("📥 API: Response status:", res.status);
    console.log("📥 API: Response headers:", Object.fromEntries(res.headers.entries()));

    const data = await res.json();
    console.log("📥 API: Response data:", data);

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return data; // { message, user }
  } catch (error: any) {
    clearTimeout(timeoutId); // Clear timeout on error

    if (error.name === 'AbortError') {
      console.error("❌ API: Request timeout after 10 seconds");
      throw new Error("Signup request timed out. Please try again.");
    }

    console.error("❌ API: Fetch error:", error);
    throw error;
  }
}





// export async function signup({ username, email, password, phone }: { username: string; email: string; password: string; phone: string }) {
//   console.log("📤 API: Sending signup request to:", `${API_BASE_URL}/auth/register`);
//   console.log("📤 API: Request body:", { username, email, password });

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ username, email, password }),
//     });

//     console.log("📥 API: Response status:", res.status);
//     console.log("📥 API: Response headers:", Object.fromEntries(res.headers.entries()));

//     const data = await res.json();
//     console.log("📥 API: Response data:", data);

//     if (!res.ok) {
//       throw new Error(data.message || "Signup failed");
//     }

//     return data; // { message, user }
//   } catch (error) {
//     console.error("❌ API: Fetch error:", error);
//     throw error;
//   }
// }

export async function verifyToken(token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Token verification failed");
  }

  return data; // { message, user }
}

export async function googleSignIn(credential: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const endpoint = `${BASE_URL}/api/auth/google`;

  console.log("📤 API: Sending Google sign-in request to:", endpoint);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });

    console.log("📥 API: Response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Google sign-in failed");
    }

    const data = await res.json();
    console.log("📥 API: Response data:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      document.cookie = `auth-token=${data.token}; path=/; max-age=86400; samesite=lax`;
    }

    return data;
  } catch (error: any) {
    console.error("❌ API: Google sign-in error:", error);
    throw error;
  }
}

export async function getUserProfile(token: string): Promise<UserData> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const url = `${BASE_URL}/api/auth/me`; // Use the working endpoint

  console.log("📤 API: Fetching user profile from:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    console.log("📥 Response status:", res.status);

    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    const data = await res.json();
    console.log("📥 Response data:", data);

    // Handle the response format { success: true, user: {...} }
    if (data.success && data.user) {
      // Map backend fields to frontend interface
      const userData: UserData = {
        _id: data.user._id || '',
        username: data.user.username || '',
        email: data.user.email || '',
        role: data.user.role || 'user',
        avatar: data.user.avatar || '',
        photo: data.user.avatar || '', // Map avatar to photo for frontend
        fullName: data.user.fullName || '',
        phone: data.user.phone || '',
        bio: data.user.bio || '',
        location: data.user.location || '',
        website: data.user.website || '',
        skills: Array.isArray(data.user.skills) ? data.user.skills : [],
        joinDate: data.user.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };

      // Store in localStorage for future use
      localStorage.setItem("user", JSON.stringify(data.user));

      return userData;
    }

    throw new Error("Unexpected response format");

  } catch (error) {
    console.error("❌ API: Failed to fetch user profile:", error);
    throw error;
  }
}







// app/lib/api.ts
export async function updateUserProfile(token: string, userData: any) {
  // Create a new object for the backend
  const backendData: any = {};

  // Copy all fields except handle avatar specially
  Object.keys(userData).forEach(key => {
    if (key === 'avatar') {
      // Map avatar to photo for backend
      backendData.photo = userData.avatar;
    } else {
      backendData[key] = userData[key];
    }
  });

  console.log("🔍 Original userData:", {
    ...userData,
    avatar: userData.avatar ? `[${userData.avatar.length} chars]` : 'none'
  });

  console.log("🔍 Mapped backendData:", {
    ...backendData,
    photo: backendData.photo ? `[${backendData.photo.length} chars]` : 'none'
  });

  const endpoint = API_BASE_URL.includes('/api') ? '/auth/update' : '/api/auth/update';

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData), // Send the mapped data
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}













// export async function updateUserProfile(token: string, userData: any) {
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
//   const url = `${BASE_URL}/api/auth/update`;

//   console.log("📤 API: Updating user profile to:", url);

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000);

//   try {
//     // Convert photo to avatar for backend
//     const requestData = {
//       ...userData,
//       avatar: userData.photo || userData.avatar,
//     };
//     delete requestData.photo;

//     const res = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(requestData),
//       signal: controller.signal
//     });

//     clearTimeout(timeoutId);

//     console.log("📥 API: Update response status:", res.status);

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("📥 API: Error response:", errorText);
//       throw new Error(`Failed to update profile: ${res.status}`);
//     }

//     const data = await res.json();
//     console.log("📥 API: Update success response:", data);

//     return data;
//   } catch (error: any) {
//     clearTimeout(timeoutId);

//     if (error.name === 'AbortError') {
//       console.error("❌ API: Request timeout after 10 seconds");
//       throw new Error("Request timeout. Server is not responding.");
//     }

//     console.error("❌ API: Failed to update user profile:", error);
//     throw error;
//   }
// }



export async function logout(token: string) {
  console.log("📤 API: Sending logout request");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Add authorization header
      },
      credentials: "include",
    });

    console.log("📥 API: Logout response status:", res.status);
    const data = await res.json();
    console.log("📥 API: Logout response data:", data);

    if (!res.ok) {
      throw new Error(data.message || "Logout failed");
    }

    // Clear client-side storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Clear cookies more effectively
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    return data;
  } catch (error) {
    console.error("❌ API: Logout error:", error);

    // Even if API call fails, clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw error;
  }
}
// Add this to lib/api.ts
export async function checkAuth() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    return res.ok;
  } catch {
    return false;
  }
}


// In D:\vishwash\12-02clone\stock-vishwash-frontend\app\lib\api.ts

// Add these new functions for forgot password functionality

export async function forgotPassword(email: string) {
  console.log("📤 API: Sending forgot password request for email:", email);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log("📥 API: Response status:", res.status);

    const data = await res.json();
    console.log("📥 API: Response data:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to send reset link");
    }

    return data; // { success: true, message: "Reset link sent to email" }
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error("❌ API: Request timeout");
      throw new Error("Request timed out. Please try again.");
    }

    console.error("❌ API: Forgot password error:", error);
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  console.log("📤 API: Sending reset password request");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data; // { success: true, message: "Password reset successfully" }
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.");
    }

    console.error("❌ API: Reset password error:", error);
    throw error;
  }
}

export async function validateResetToken(token: string) {
  console.log("📤 API: Validating reset token");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/validate-reset-token/${token}`, {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Invalid or expired token");
    }

    return data; // { success: true, valid: true }
  } catch (error) {
    console.error("❌ API: Validate token error:", error);
    throw error;
  }
}
























// // lib/api.ts

// export interface UserData {
//   location: string;
//   website: string;
//   skills: never[];
//   joinDate: string;
//   _id: string;
//   username: string;
//   email: string;
//   role: string;
//   photo: string;
//   fullName?: string;
//   phone?: string;
//   bio?: string;
// }


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
//   ? `${process.env.NEXT_PUBLIC_API_URL}/api`
//   : 'http://localhost:5000/api';

// export async function signin(email: string, password: string) {
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
//   const endpoint = `${BASE_URL}/api/auth/Authentication/signin`;

//   console.log("📤 API: Sending signin request to:", endpoint);

//   try {
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include", // IMPORTANT: Include credentials for cookies
//       body: JSON.stringify({ email, password }),
//     });

//     console.log("📥 API: Response status:", res.status);

//     if (!res.ok) {
//       throw new Error(`Signin failed with status ${res.status}`);
//     }

//     const data = await res.json();
//     console.log("📥 API: Response data:", data);

//     if (data.token) {
//       console.log("✅ Token received, storing...");

//       // 1. Store in localStorage for client-side access
//       localStorage.setItem("token", data.token);

//       if (data.user) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }

//       // 2. Set cookie for middleware (non-HttpOnly so client can read it)
//       document.cookie = `auth-token=${data.token}; path=/; max-age=86400; samesite=lax`;

//       // 3. Also set as HttpOnly cookie for backend API calls
//       document.cookie = `token=${data.token}; path=/; max-age=86400; httponly; samesite=lax`;
//     }

//     return data;
//   } catch (error: any) {
//     console.error("❌ API: Fetch error:", error);
//     throw error;
//   }
// }


// export const getStocks = async () => {
//   const res = await fetch(`${API_BASE_URL}/stocks`, {
//     credentials: 'include',
//   })

//   if (!res.ok) throw new Error('Failed to fetch stocks')
//   return res.json()
// }

// export const getStock = async (symbol: string) => {
//   const res = await fetch(`${API_BASE_URL}/stocks/${symbol}`, {
//     credentials: 'include',
//   })

//   if (!res.ok) throw new Error('Failed to fetch stock')
//   return res.json()
// }

// export const getStockHistory = async (symbol: string) => {
//   const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/history`, {
//     credentials: 'include',
//   })

//   if (!res.ok) throw new Error('Failed to fetch history')
//   return res.json()
// }



// export async function signup({ username, email, password, phone }: { username: string; email: string; password: string; phone: string }) {
//   console.log("📤 API: Sending signup request to:", `${API_BASE_URL}/auth/register`);
//   console.log("📤 API: Request body:", { username, email, password, phone }); // Added phone to log

//   // Add timeout to prevent hanging
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({
//         username,
//         email,
//         password,
//         phone  // ✅ Now sending phone number!
//       }),
//       signal: controller.signal // Add abort signal
//     });

//     clearTimeout(timeoutId); // Clear timeout on success

//     console.log("📥 API: Response status:", res.status);
//     console.log("📥 API: Response headers:", Object.fromEntries(res.headers.entries()));

//     const data = await res.json();
//     console.log("📥 API: Response data:", data);

//     if (!res.ok) {
//       throw new Error(data.message || "Signup failed");
//     }

//     return data; // { message, user }
//   } catch (error: any) {
//     clearTimeout(timeoutId); // Clear timeout on error

//     if (error.name === 'AbortError') {
//       console.error("❌ API: Request timeout after 10 seconds");
//       throw new Error("Signup request timed out. Please try again.");
//     }

//     console.error("❌ API: Fetch error:", error);
//     throw error;
//   }
// }





// // export async function signup({ username, email, password, phone }: { username: string; email: string; password: string; phone: string }) {
// //   console.log("📤 API: Sending signup request to:", `${API_BASE_URL}/auth/register`);
// //   console.log("📤 API: Request body:", { username, email, password });

// //   try {
// //     const res = await fetch(`${API_BASE_URL}/auth/register`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       credentials: "include",
// //       body: JSON.stringify({ username, email, password }),
// //     });

// //     console.log("📥 API: Response status:", res.status);
// //     console.log("📥 API: Response headers:", Object.fromEntries(res.headers.entries()));

// //     const data = await res.json();
// //     console.log("📥 API: Response data:", data);

// //     if (!res.ok) {
// //       throw new Error(data.message || "Signup failed");
// //     }

// //     return data; // { message, user }
// //   } catch (error) {
// //     console.error("❌ API: Fetch error:", error);
// //     throw error;
// //   }
// // }

// export async function verifyToken(token: string) {
//   const res = await fetch(`${API_BASE_URL}/auth/verify`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`
//     },
//     credentials: "include",
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.message || "Token verification failed");
//   }

//   return data; // { message, user }
// }

// export async function getUserProfile(token: string): Promise<UserData> {
//   // Use base URL without /api suffix since we'll add it manually
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

//   console.log("📤 API: Fetching user profile with token:", token.substring(0, 20) + "...");

//   try {
//     // Try different possible endpoints
//     const endpoints = [
//       `${BASE_URL}/api/auth/me`,           // Most likely
//       `${BASE_URL}/api/auth/Authentication/me`, // If follows same pattern as signin
//       `${BASE_URL}/auth/me`,               // Without /api prefix
//       `${BASE_URL}/api/me`,                // Alternative
//       `${BASE_URL}/me`                     // Fallback
//     ];

//     let lastError: Error | null = null;

//     for (const url of endpoints) {
//       console.log(`📤 Trying: ${url}`);

//       try {
//         const res = await fetch(url, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//           },
//         });

//         console.log(`📥 Response status for ${url}:`, res.status);

//         if (res.ok) {
//           const data = await res.json();
//           console.log(`✅ Success with ${url}:`, data);

//           // Handle different response formats
//           if (data.user) {
//             return data.user as UserData; // Format: { user: {...} }
//           } else if (data._id || data.username) {
//             return data as UserData; // Format: user object directly
//           } else {
//             console.warn("Unexpected response format:", data);
//             continue; // Try next endpoint
//           }
//         } else if (res.status !== 404) {
//           // For non-404 errors, try to parse error
//           const errorData = await res.json() as { message?: string };
//           lastError = new Error(errorData.message || `Failed with status ${res.status}`);
//           console.log(`❌ ${url} failed:`, lastError.message);
//         } else {
//           console.log(`❌ ${url} returned 404`);
//         }
//       } catch (error) {
//         const err = error as Error;
//         console.log(`❌ ${url} error:`, err.message);
//         lastError = err;
//       }
//     }

//     // If all endpoints fail
//     throw lastError || new Error("All user profile endpoints failed");

//   } catch (error) {
//     const err = error as Error;
//     console.error("❌ API: Failed to fetch user profile:", err);
//     throw err;
//   }
// }

// export async function updateUserProfile(token: string, userData: any) {
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
//   const url = `${BASE_URL}/api/auth/update`;

//   console.log("📤 API: Updating user profile to:", url);

//   // Create abort controller for timeout
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

//   try {
//     const res = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(userData),
//       signal: controller.signal // Add abort signal
//     });

//     clearTimeout(timeoutId); // Clear timeout on success

//     console.log("📥 API: Update response status:", res.status);

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("📥 API: Error response:", errorText);

//       try {
//         const errorData = JSON.parse(errorText);
//         throw new Error(errorData.message || `Failed to update profile: ${res.status}`);
//       } catch {
//         throw new Error(errorText || `Failed to update profile with status ${res.status}`);
//       }
//     }

//     const data = await res.json();
//     console.log("📥 API: Update success response:", data);

//     return data;
//   } catch (error: any) {
//     clearTimeout(timeoutId); // Clear timeout on error

//     if (error.name === 'AbortError') {
//       console.error("❌ API: Request timeout after 10 seconds");
//       throw new Error("Request timeout. Server is not responding.");
//     }

//     console.error("❌ API: Failed to update user profile:", error);
//     throw error;
//   }
// }


// export async function logout(token: string) {
//   console.log("📤 API: Sending logout request");

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/logout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Add authorization header
//       },
//       credentials: "include",
//     });

//     console.log("📥 API: Logout response status:", res.status);
//     const data = await res.json();
//     console.log("📥 API: Logout response data:", data);

//     if (!res.ok) {
//       throw new Error(data.message || "Logout failed");
//     }

//     // Clear client-side storage
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");

//     // Clear cookies more effectively
//     document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//     document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//     document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

//     return data;
//   } catch (error) {
//     console.error("❌ API: Logout error:", error);

//     // Even if API call fails, clear local storage
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     throw error;
//   }
// }
// // Add this to lib/api.ts
// export async function checkAuth() {
//   try {
//     const token = localStorage.getItem("token");
//     if (!token) return false;

//     const res = await fetch(`${API_BASE_URL}/auth/verify`, {
//       headers: {
//         "Authorization": `Bearer ${token}`
//       }
//     });

//     return res.ok;
//   } catch {
//     return false;
//   }
// }


// // In D:\vishwash\12-02clone\stock-vishwash-frontend\app\lib\api.ts

// // Add these new functions for forgot password functionality

// export async function forgotPassword(email: string) {
//   console.log("📤 API: Sending forgot password request for email:", email);

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ email }),
//       signal: controller.signal
//     });

//     clearTimeout(timeoutId);

//     console.log("📥 API: Response status:", res.status);

//     const data = await res.json();
//     console.log("📥 API: Response data:", data);

//     if (!res.ok) {
//       throw new Error(data.message || "Failed to send reset link");
//     }

//     return data; // { success: true, message: "Reset link sent to email" }
//   } catch (error: any) {
//     clearTimeout(timeoutId);

//     if (error.name === 'AbortError') {
//       console.error("❌ API: Request timeout");
//       throw new Error("Request timed out. Please try again.");
//     }

//     console.error("❌ API: Forgot password error:", error);
//     throw error;
//   }
// }

// export async function resetPassword(token: string, newPassword: string) {
//   console.log("📤 API: Sending reset password request");

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000);

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ token, newPassword }),
//       signal: controller.signal
//     });

//     clearTimeout(timeoutId);

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Failed to reset password");
//     }

//     return data; // { success: true, message: "Password reset successfully" }
//   } catch (error: any) {
//     clearTimeout(timeoutId);

//     if (error.name === 'AbortError') {
//       throw new Error("Request timed out. Please try again.");
//     }

//     console.error("❌ API: Reset password error:", error);
//     throw error;
//   }
// }

// export async function validateResetToken(token: string) {
//   console.log("📤 API: Validating reset token");

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/validate-reset-token/${token}`, {
//       credentials: "include",
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Invalid or expired token");
//     }

//     return data; // { success: true, valid: true }
//   } catch (error) {
//     console.error("❌ API: Validate token error:", error);
//     throw error;
//   }
// }.error("❌ API: Request timeout");
//       throw new Error("Request timed out. Please try again.");
//     }

//     console.error("❌ API: Forgot password error:", error);
//     throw error;
//   }
// }

// export async function resetPassword(token: string, newPassword: string) {
//   console.log("📤 API: Sending reset password request");

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 10000);

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ token, newPassword }),
//       signal: controller.signal
//     });

//     clearTimeout(timeoutId);

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Failed to reset password");
//     }

//     return data; // { success: true, message: "Password reset successfully" }
//   } catch (error: any) {
//     clearTimeout(timeoutId);

//     if (error.name === 'AbortError') {
//       throw new Error("Request timed out. Please try again.");
//     }

//     console.error("❌ API: Reset password error:", error);
//     throw error;
//   }
// }

// export async function validateResetToken(token: string) {
//   console.log("📤 API: Validating reset token");

//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/validate-reset-token/${token}`, {
//       credentials: "include",
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Invalid or expired token");
//     }

//     return data; // { success: true, valid: true }
//   } catch (error) {
//     console.error("❌ API: Validate token error:", error);
//     throw error;
//   }
// }
// 

// AI AGENT API FUNCTIONS
export async function getAIConversations(token: string) {
  const res = await fetch(`${API_BASE_URL}/ai-agent/conversations`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch AI conversations');
  return res.json();
}

export async function getAIConversationMessages(token: string, conversationId: string) {
  const res = await fetch(`${API_BASE_URL}/ai-agent/conversations/${conversationId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch AI chat history');
  return res.json();
}

export async function deleteAIConversation(token: string, conversationId: string) {
  const res = await fetch(`${API_BASE_URL}/ai-agent/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete AI conversation');
  return res.json();
}


export const subscriptionApi = {
  // Get all available plans
  getPlans: async () => {
    const response = await fetch(`${API_BASE_URL}/subscription/plans`);
    return response.json();
  },

  // Get current user subscription
  getCurrentSubscription: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription/current`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // Update subscription
  updateSubscription: async (token: string, planId: string, paymentMethod: string = 'card') => {
    const response = await fetch(`${API_BASE_URL}/subscription/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planId, paymentMethod })
    });
    return response.json();
  },

  // Cancel subscription
  cancelSubscription: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // Get payment history
  getPaymentHistory: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/subscription/payments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};



export async function queryAIAgent(token: string, query: string, conversationId?: string) {
  const res = await fetch(`${API_BASE_URL}/ai-agent/query`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ query, conversationId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'AI request failed');
  }
  return res.json();
}