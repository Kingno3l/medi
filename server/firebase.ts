import * as admin from "firebase-admin";
import { MOCK_RESOURCES, type Resource } from "./lib/mock-data";
import { TRIAGE_GRAPH, type TriageNode } from "./lib/triage-data";

let db: any = null;
let isFallback = false;

// Attempt to initialize Firebase Admin
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (serviceAccountPath) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      databaseURL
    });
    db = admin.firestore();
    console.log("🔥 Firebase Firestore connected successfully!");
  } else {
    throw new Error("No service account path specified. Falling back to local state database.");
  }
} catch (error: any) {
  isFallback = true;
  console.warn("⚠️ Firebase connection omitted:", error.message);
  console.log("📦 Initializing in-memory fail-safe local state engine...");
}

// Memory database instance
let memoryFacilities: Resource[] = [...MOCK_RESOURCES];
let memoryTriageNodes: Record<string, TriageNode> = { ...TRIAGE_GRAPH };

export async function getFacilitiesCollection(): Promise<Resource[]> {
  if (isFallback || !db) {
    return memoryFacilities;
  }
  try {
    const snapshot = await db.collection("facilities").get();
    if (snapshot.empty) {
      console.log("Seed: Populating empty Firestore database with mock data...");
      // Auto seed Firestore if empty
      for (const f of MOCK_RESOURCES) {
        await db.collection("facilities").doc(f.id).set(f);
      }
      return MOCK_RESOURCES;
    }
    return snapshot.docs.map((doc: any) => doc.data() as Resource);
  } catch (err) {
    console.error("Firestore read error, falling back to local:", err);
    return memoryFacilities;
  }
}

export async function updateFacilityWaitTime(id: string, waitMinutes: number): Promise<boolean> {
  if (isFallback || !db) {
    memoryFacilities = memoryFacilities.map((f) =>
      f.id === id ? { ...f, waitMinutes, verifiedMinutesAgo: 0 } : f
    );
    return true;
  }
  try {
    await db.collection("facilities").doc(id).update({
      waitMinutes,
      verifiedMinutesAgo: 0
    });
    return true;
  } catch (err) {
    console.error("Firestore write error, updating in-memory:", err);
    memoryFacilities = memoryFacilities.map((f) =>
      f.id === id ? { ...f, waitMinutes, verifiedMinutesAgo: 0 } : f
    );
    return true;
  }
}

export async function getTriageNode(nodeId: string): Promise<TriageNode | null> {
  if (isFallback || !db) {
    return memoryTriageNodes[nodeId] || null;
  }
  try {
    const doc = await db.collection("triage_nodes").doc(nodeId).get();
    if (!doc.exists) {
      // Seed if not exists
      const seedNode = TRIAGE_GRAPH[nodeId];
      if (seedNode) {
        await db.collection("triage_nodes").doc(nodeId).set(seedNode);
        return seedNode;
      }
      return null;
    }
    return doc.data() as TriageNode;
  } catch (err) {
    console.error("Firestore triage read error, using in-memory:", err);
    return memoryTriageNodes[nodeId] || null;
  }
}
