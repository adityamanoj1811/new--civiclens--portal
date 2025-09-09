export interface User {
  email: string
  role: "Admin" | "Team Member" | "Department Head"
  department?: string
  name?: string
  avatar?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Admin credentials
  if (email === "admin@civiclens.com" && password === "admin123") {
    return {
      email,
      role: "Admin",
      name: "Admin User",
      avatar: "/admin-avatar.png",
    }
  }

  // Team Member credentials
  if (email === "member@civiclens.com" && password === "member123") {
    return {
      email,
      role: "Team Member",
      name: "Priya Sharma",
      department: "Field Operations",
      avatar: "/member-avatar.png",
    }
  }

  // Department Head credentials
  if (email === "dept@civiclens.com" && password === "dept123") {
    return {
      email,
      role: "Department Head",
      name: "Rajesh Kumar",
      department: "Public Works",
      avatar: "/dept-avatar.png",
    }
  }

  return null
}
