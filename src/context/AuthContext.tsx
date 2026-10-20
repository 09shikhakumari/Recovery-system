import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface StudentProfile {
  uid: string;
  displayName: string;
  email: string;
  university: string;
  studentId: string;
  major: string;
  academicYear: string;
  avatarUrl: string;
}

export const DEMO_PROFILES: Record<'alex' | 'jordan' | 'taylor', StudentProfile> = {
  alex: {
    uid: 'demo-alex',
    displayName: 'Alex Mercer',
    email: 'alex.mercer@university.edu',
    university: 'State University',
    studentId: '#8492019',
    major: 'Computer Science & Bio Minor',
    academicYear: 'Junior (Year 3)',
    avatarUrl: '/src/assets/images/student_avatar_1792510906047.jpg',
  },
  jordan: {
    uid: 'demo-jordan',
    displayName: 'Jordan Taylor',
    email: 'jordan.t@university.edu',
    university: 'State University',
    studentId: '#9182304',
    major: 'Biochemistry (Pre-Med)',
    academicYear: 'Sophomore (Year 2)',
    avatarUrl: '/src/assets/images/student_avatar_1792510906047.jpg',
  },
  taylor: {
    uid: 'demo-taylor',
    displayName: 'Taylor Reed',
    email: 'taylor.r@university.edu',
    university: 'State University',
    studentId: '#7730192',
    major: 'Economics & Mathematics',
    academicYear: 'Senior (Year 4)',
    avatarUrl: '/src/assets/images/student_avatar_1792510906047.jpg',
  },
};

interface AuthContextType {
  currentUser: User | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, studentId?: string, major?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoStudent: (key: 'alex' | 'jordan' | 'taylor') => void;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('catchup_student_profile');
      return saved ? JSON.parse(saved) : DEMO_PROFILES.alex;
    } catch {
      return DEMO_PROFILES.alex;
    }
  });
  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    return localStorage.getItem('catchup_is_demo') !== 'false';
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile from firestore when logged in with real Firebase user
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const profile: StudentProfile = {
          uid: user.uid,
          displayName: data.displayName || user.displayName || 'College Student',
          email: user.email || '',
          university: data.university || 'State University',
          studentId: data.studentId || '#STU-' + user.uid.slice(0, 6).toUpperCase(),
          major: data.major || 'Undergraduate Studies',
          academicYear: data.academicYear || 'Year 3',
          avatarUrl: user.photoURL || '/src/assets/images/student_avatar_1792510906047.jpg',
        };
        setStudentProfile(profile);
        localStorage.setItem('catchup_student_profile', JSON.stringify(profile));
      } else {
        // Create initial firestore profile
        const newProfile: StudentProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'College Student',
          email: user.email || '',
          university: 'State University',
          studentId: '#STU-' + user.uid.slice(0, 6).toUpperCase(),
          major: 'General Studies',
          academicYear: 'Year 2',
          avatarUrl: user.photoURL || '/src/assets/images/student_avatar_1792510906047.jpg',
        };
        await setDoc(userRef, {
          ...newProfile,
          createdAt: new Date().toISOString(),
        });
        setStudentProfile(newProfile);
        localStorage.setItem('catchup_student_profile', JSON.stringify(newProfile));
      }
    } catch (e) {
      console.warn('Could not load firestore profile; using fallback profile', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);
        localStorage.setItem('catchup_is_demo', 'false');
        await fetchUserProfile(user);
      } else {
        setCurrentUser(null);
        // If not a demo user, clear profile
        if (localStorage.getItem('catchup_is_demo') === 'false') {
          setStudentProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setIsDemoUser(false);
      localStorage.setItem('catchup_is_demo', 'false');
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    studentId?: string,
    major?: string
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      const userRef = doc(db, 'users', res.user.uid);
      const newProfile: StudentProfile = {
        uid: res.user.uid,
        displayName: name,
        email: email,
        university: 'State University',
        studentId: studentId || '#STU-' + res.user.uid.slice(0, 6).toUpperCase(),
        major: major || 'Undergraduate Studies',
        academicYear: 'Year 1',
        avatarUrl: '/src/assets/images/student_avatar_1792510906047.jpg',
      };
      await setDoc(userRef, {
        ...newProfile,
        createdAt: new Date().toISOString(),
      });
      setStudentProfile(newProfile);
      setIsDemoUser(false);
      localStorage.setItem('catchup_is_demo', 'false');
      localStorage.setItem('catchup_student_profile', JSON.stringify(newProfile));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setIsDemoUser(false);
      localStorage.setItem('catchup_is_demo', 'false');
      await fetchUserProfile(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoStudent = (key: 'alex' | 'jordan' | 'taylor') => {
    const profile = DEMO_PROFILES[key];
    setStudentProfile(profile);
    setIsDemoUser(true);
    localStorage.setItem('catchup_is_demo', 'true');
    localStorage.setItem('catchup_student_profile', JSON.stringify(profile));
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isDemoUser) {
        await firebaseSignOut(auth);
      }
      setCurrentUser(null);
      setStudentProfile(null);
      localStorage.removeItem('catchup_student_profile');
      localStorage.removeItem('catchup_is_demo');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<StudentProfile>) => {
    if (!studentProfile) return;
    const updated = { ...studentProfile, ...data };
    setStudentProfile(updated);
    localStorage.setItem('catchup_student_profile', JSON.stringify(updated));

    if (currentUser && !isDemoUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (e) {
        console.warn('Could not update profile in firestore', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        loading,
        isDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemoStudent,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
