import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitQuery,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { UserProfile, Post, Notification } from "../types/database";

// User operations
export const createUser = async (user: UserProfile) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    ...user,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
};

// Post operations
export const createPost = async (post: Post) => {
  const postRef = doc(db, "posts", post.id);
  await setDoc(postRef, {
    ...post,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const updatePost = async (postId: string, data: Partial<Post>) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
};

export const getPostsByUser = async (
  userId: string,
  status?: Post["status"]
): Promise<Post[]> => {
  const postsRef = collection(db, "posts");
  const constraints: QueryConstraint[] = [where("userId", "==", userId)];

  if (status) {
    constraints.push(where("status", "==", status));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(postsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Post)
  );
};

export const getScheduledPosts = async (userId: string): Promise<Post[]> => {
  const postsRef = collection(db, "posts");
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId),
    where("status", "==", "scheduled"),
    where("scheduledFor", ">=", Timestamp.now()),
    orderBy("scheduledFor", "asc"),
  ];

  const q = query(postsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Post)
  );
};

// Notification operations
export const createNotification = async (notification: Notification) => {
  const notificationRef = doc(db, "notifications", notification.id);
  await setDoc(notificationRef, {
    ...notification,
    createdAt: Timestamp.now(),
  });
};

export const updateNotification = async (
  notificationId: string,
  data: Partial<Notification>
) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, data);
};

export const getNotificationsByUser = async (
  userId: string,
  maxResults?: number
): Promise<Notification[]> => {
  const notificationsRef = collection(db, "notifications");
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  ];

  if (maxResults) {
    constraints.push(limitQuery(maxResults));
  }

  const q = query(notificationsRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot<DocumentData>) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Notification)
  );
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
};

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
