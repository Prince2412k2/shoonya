import { Blob } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

let blobClient;

function getBlobClient() {
  if (!blobClient) {
    blobClient = new Blob({
      token: BLOB_TOKEN,
    });
  }
  return blobClient;
}

const DB_FILE = 'db.json';

async function readDB() {
  try {
    const blob = getBlobClient();
    const existing = await blob(DB_FILE, { stream() { 
      return new ReadableStream({
        start(controller) {
          controller.close();
        }
      });
    } }).catch(() => null);
    
    if (existing) {
      const text = await existing.text();
      return JSON.parse(text);
    }
  } catch (error) {
    return null;
  }
  return {};
}

async function writeDB(data) {
  const blob = getBlobClient();
  await blob.save(DB_FILE, JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function getCollection(name) {
  const db = await readDB();
  return db[name] || [];
}

export async function setCollection(name, data) {
  const db = await readDB() || {};
  db[name] = data;
  await writeDB(db);
  return data;
}

export async function insert(name, item) {
  const collection = await getCollection(name);
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  collection.push(newItem);
  await setCollection(name, collection);
  return newItem;
}

export async function update(name, id, updates) {
  const collection = await getCollection(name);
  const index = collection.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  collection[index] = {
    ...collection[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await setCollection(name, collection);
  return collection[index];
}

export async function remove(name, id) {
  const collection = await getCollection(name);
  const filtered = collection.filter(item => item.id !== id);
  await setCollection(name, filtered);
  return true;
}

export async function findById(name, id) {
  const collection = await getCollection(name);
  return collection.find(item => item.id === id) || null;
}