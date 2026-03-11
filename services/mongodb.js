import { connectDB } from "@/lib/mongodb";

export async function withDB(fn) {
  await connectDB();
  return fn();
}
