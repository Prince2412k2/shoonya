import { getCollection, insert, update, remove, findById, setCollection } from '../../lib/blob-db.js';

export async function GET(request, { params }) {
  const { collection } = params;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const item = await findById(collection, id);
    if (!item) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json(item);
  }

  const data = await getCollection(collection);
  return Response.json(data);
}

export async function POST(request, params) {
  const { collection } = params;
  const body = await request.json();
  const item = await insert(collection, body);
  return Response.json(item, { status: 201 });
}

export async function PUT(request, { params }) {
  const { collection } = params;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return Response.json({ error: 'ID required' }, { status: 400 });
  }
  
  const body = await request.json();
  const item = await update(collection, id, body);
  
  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json(item);
}

export async function DELETE(request, { params }) {
  const { collection } = params;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return Response.json({ error: 'ID required' }, { status: 400 });
  }
  
  await remove(collection, id);
  return Response.json({ success: true });
}