import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebase/config";
import { dbService } from "../services/db";
import { UserProfile, UserRole } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, name: string, phone: string, role: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<UserProfile>;
  toggleFavorite: (templeId: string) => Promise<void>;
  updateProfile: (name: string, phone: string, photo: string) => Promise<void>;
  googleSignIn: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and listen to Auth state changes
  useEffect(() => {
    // Check if there is a local demo session saved
    const savedDemoUser = localStorage.getItem("de_demo_user");
    if (savedDemoUser) {
      try {
        const u = JSON.parse(savedDemoUser);
        setUser(u);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Error reading saved demo user", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          let profile = await dbService.getUserProfile(firebaseUser.uid);
          if (!profile) {
            // Create a default profile if it doesn't exist
            profile = {
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Devotee",
              email: firebaseUser.email || "",
              photo: firebaseUser.photoURL || "",
              role: "devotee",
              createdAt: new Date().toISOString(),
              favorites: []
            };
            await dbService.saveUserProfile(profile);
          }
          setUser(profile);
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback user if database fails
          setUser({
            userId: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Devotee",
            email: firebaseUser.email || "",
            role: "devotee",
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      let profile = await dbService.getUserProfile(credential.user.uid);
      if (!profile) {
        profile = {
          userId: credential.user.uid,
          name: credential.user.displayName || email.split("@")[0],
          email: email,
          role: "devotee",
          createdAt: new Date().toISOString()
        };
        await dbService.saveUserProfile(profile);
      }
      setUser(profile);
      localStorage.removeItem("de_demo_user");
      setLoading(false);
      return profile;
    } catch (e: any) {
      setLoading(false);
      throw new Error(e.message || "Failed to sign in");
    }
  };

  const register = async (email: string, name: string, phone: string, role: UserRole): Promise<UserProfile> => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, "password123"); // Default temporary password
      const profile: UserProfile = {
        userId: credential.user.uid,
        name: name,
        email: email,
        phone: phone,
        role: role,
        createdAt: new Date().toISOString(),
        favorites: []
      };
      await dbService.saveUserProfile(profile);
      setUser(profile);
      localStorage.removeItem("de_demo_user");
      setLoading(false);
      return profile;
    } catch (e: any) {
      setLoading(false);
      throw new Error(e.message || "Failed to register account");
    }
  };

  const googleSignIn = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      let profile = await dbService.getUserProfile(credential.user.uid);
      if (!profile) {
        profile = {
          userId: credential.user.uid,
          name: credential.user.displayName || "Devotee",
          email: credential.user.email || "",
          photo: credential.user.photoURL || "",
          role: "devotee",
          createdAt: new Date().toISOString(),
          favorites: []
        };
        await dbService.saveUserProfile(profile);
      }
      setUser(profile);
      localStorage.removeItem("de_demo_user");
      setLoading(false);
      return profile;
    } catch (e: any) {
      setLoading(false);
      throw new Error(e.message || "Google sign-in failed");
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    localStorage.removeItem("de_demo_user");
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase logout failed", e);
    }
    setLoading(false);
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      throw new Error(e.message || "Failed to send reset email");
    }
  };

  const loginAsDemo = async (role: UserRole): Promise<UserProfile> => {
    setLoading(true);
    // Standard Demo Accounts
    const demoProfiles: Record<UserRole, UserProfile> = {
      devotee: {
        userId: "demo-devotee-123",
        name: "Ananya Sharma",
        email: "ananya@example.com",
        phone: "+91 9876543210",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        role: "devotee",
        createdAt: new Date().toISOString(),
        favorites: ["tirupati", "srisailam"]
      },
      temple_admin: {
        userId: "demo-admin-456",
        name: "Pandit Rajesh Sastry",
        email: "rajesh.admin@darshanease.com",
        phone: "+91 9998887776",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        role: "temple_admin",
        createdAt: new Date().toISOString(),
        favorites: []
      },
      super_admin: {
        userId: "demo-super-789",
        name: "Suresh Kumar (Devesthanam Commissioner)",
        email: "suresh.commissioner@gov.in",
        phone: "+91 9888777666",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        role: "super_admin",
        createdAt: new Date().toISOString(),
        favorites: []
      }
    };

    const profile = demoProfiles[role];
    setUser(profile);
    localStorage.setItem("de_demo_user", JSON.stringify(profile));
    
    // Save to services too for persistence
    await dbService.saveUserProfile(profile);
    
    setLoading(false);
    return profile;
  };

  const toggleFavorite = async (templeId: string): Promise<void> => {
    if (!user) return;
    const currentFavs = user.favorites || [];
    let updatedFavs: string[] = [];
    if (currentFavs.includes(templeId)) {
      updatedFavs = currentFavs.filter(id => id !== templeId);
    } else {
      updatedFavs = [...currentFavs, templeId];
    }

    const updatedUser = { ...user, favorites: updatedFavs };
    setUser(updatedUser);
    
    // Save to storage & cloud
    if (user.userId.startsWith("demo-")) {
      localStorage.setItem("de_demo_user", JSON.stringify(updatedUser));
    }
    await dbService.saveUserProfile(updatedUser);
  };

  const updateProfile = async (name: string, phone: string, photo: string): Promise<void> => {
    if (!user) return;
    const updatedUser = { ...user, name, phone, photo };
    setUser(updatedUser);

    if (user.userId.startsWith("demo-")) {
      localStorage.setItem("de_demo_user", JSON.stringify(updatedUser));
    }
    await dbService.saveUserProfile(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      resetPassword,
      loginAsDemo,
      toggleFavorite,
      updateProfile,
      googleSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
