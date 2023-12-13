import dbClient from './db';

async function checkParentId(id) {
  const file = await dbClient.getFile({ id });
  if (!file) return { error: 'Parent not found' };

  const { type } = file;

  if (type !== 'folder') return { error: 'Parent is not a folder' };
  return file;
}

async function validatePostRequest(req) {
  // prettier-ignore
  const {
    name,
    type,
    parentId,
    data,
  } = req.body;

  if (!name) return { success: false, error: 'Missing name' };
  if (!type) return { success: false, error: 'Missing type' };
  if (!data && type !== 'folder') {
    return { success: false, error: 'Missing data' };
  }

  if (parentId) {
    const parent = await checkParentId(parentId);

    const { error } = parent;
    if (!error) return { error };
  }

  return { success: true, error: 'NONE' };
}

export { validatePostRequest, checkParentId };
