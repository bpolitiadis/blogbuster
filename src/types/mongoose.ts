import { Document } from "mongoose";

// Type guard for checking if a document has been populated
export function isPopulated<T extends Document>(
  doc: T | undefined | null
): doc is T {
  return doc !== null && doc !== undefined;
}

// Helper for type assertion with IUser
export function assertIUser<T extends Document>(doc: T | null): T {
  if (!doc) {
    throw new Error("Document not found");
  }
  return doc;
}
