import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  collection,
} from "firebase/firestore";
import app from "../config/firebase";

interface LoginAttempt {
  attempts: number;
  lastAttempt: Timestamp;
  lockedUntil: Timestamp | null;
}

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;
const COLLECTION_NAME = "loginAttempts";

export class LoginAttemptService {
  private db = getFirestore(app);

  private getAttemptsRef(email: string) {
    return doc(collection(this.db, COLLECTION_NAME), email);
  }

  private async initializeAttempts(email: string): Promise<void> {
    const docRef = this.getAttemptsRef(email);
    await setDoc(
      docRef,
      {
        attempts: 0,
        lastAttempt: serverTimestamp(),
        lockedUntil: null,
      },
      { merge: true }
    );
  }

  async checkAttempts(
    email: string
  ): Promise<{ canAttempt: boolean; remainingTime?: number }> {
    try {
      const docRef = this.getAttemptsRef(email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await this.initializeAttempts(email);
        return { canAttempt: true };
      }

      const data = docSnap.data() as LoginAttempt;

      // Check if account is locked
      if (data.lockedUntil) {
        const now = Timestamp.now();

        if (now.seconds < data.lockedUntil.seconds) {
          const remainingTime = Math.ceil(
            data.lockedUntil.seconds - now.seconds
          );
          return {
            canAttempt: false,
            remainingTime,
          };
        }

        // Lock period has expired, reset attempts
        await this.resetAttempts(email);
        return { canAttempt: true };
      }

      // Check if max attempts reached
      if (data.attempts >= MAX_ATTEMPTS) {
        // Lock the account
        const now = Timestamp.now();
        const lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
        await setDoc(
          docRef,
          {
            ...data,
            lockedUntil,
          },
          { merge: true }
        );
        return {
          canAttempt: false,
          remainingTime: COOLDOWN_SECONDS,
        };
      }

      return { canAttempt: true };
    } catch (error) {
      console.error("Error checking attempts:", error);
      // Default to allowing the attempt if there's an error
      return { canAttempt: true };
    }
  }

  async recordAttempt(email: string, success: boolean): Promise<void> {
    try {
      const docRef = this.getAttemptsRef(email);
      let docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await this.initializeAttempts(email);
        docSnap = await getDoc(docRef);
      }

      if (success) {
        // Reset attempts on successful login
        await this.resetAttempts(email);
        return;
      }

      const data = docSnap.exists()
        ? (docSnap.data() as LoginAttempt)
        : { attempts: 0, lastAttempt: serverTimestamp(), lockedUntil: null };
      const attempts = data.attempts + 1;
      let lockedUntil: Timestamp | null = null;

      if (attempts >= MAX_ATTEMPTS) {
        const now = Timestamp.now();
        lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
      }

      await setDoc(
        docRef,
        {
          attempts,
          lastAttempt: serverTimestamp(),
          lockedUntil,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error recording attempt:", error);
    }
  }

  private async resetAttempts(email: string): Promise<void> {
    try {
      const docRef = this.getAttemptsRef(email);
      await setDoc(
        docRef,
        {
          attempts: 0,
          lastAttempt: serverTimestamp(),
          lockedUntil: null,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error resetting attempts:", error);
    }
  }

  async getRemainingAttempts(email: string): Promise<number> {
    try {
      const docRef = this.getAttemptsRef(email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await this.initializeAttempts(email);
        return MAX_ATTEMPTS;
      }

      const data = docSnap.data() as LoginAttempt;

      // If account is locked, return 0
      if (data.lockedUntil) {
        const now = Timestamp.now();
        if (now.seconds < data.lockedUntil.seconds) {
          return 0;
        }
        // Lock period has expired, reset attempts
        await this.resetAttempts(email);
        return MAX_ATTEMPTS;
      }

      // Return remaining attempts
      return Math.max(0, MAX_ATTEMPTS - data.attempts);
    } catch (error) {
      console.error("Error getting remaining attempts:", error);
      return MAX_ATTEMPTS;
    }
  }
}

export const loginAttemptService = new LoginAttemptService();
