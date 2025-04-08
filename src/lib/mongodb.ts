import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}

export async function getCollection(collectionName: string) {
  const db = await getDB();
  return db.collection(collectionName);
}

export async function insertDocument(collectionName: string, document: any) {
  const collection = await getCollection(collectionName);
  return collection.insertOne(document);
}

export async function findDocument(collectionName: string, query: any) {
  const collection = await getCollection(collectionName);
  return collection.findOne(query);
}

export async function updateDocument(collectionName: string, query: any, update: any) {
  const collection = await getCollection(collectionName);
  return collection.updateOne(query, { $set: update });
}

export async function deleteDocument(collectionName: string, query: any) {
  const collection = await getCollection(collectionName);
  return collection.deleteOne(query);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  }
}); 