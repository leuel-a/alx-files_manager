import { Buffer } from 'node:buffer';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'node:fs/promises';
import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uId = await redisClient.get(`auth_${token}`);
    if (!uId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = dbClient.db
      .collection('users')
      .findOne({ _id: ObjectId(uId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // prettier-ignore
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing Name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && (type === 'file' || type === 'image')) {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parent = null;

    if (parentId) {
      parent = dbClient.db
        .collections('files')
        .findOne({ _id: ObjectId(parentId) });

      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      const folder = {
        userId: uId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      };

      const newFolder = dbClient.db.collections('files').insertOne(folder);
      return res.status(201).json(newFolder);
    }

    const rootPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4().toString();

    const path = `${rootPath}/${fileName}`;
    const newItem = {
      userId: uId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: path,
    };

    let buffer = Buffer.from(data, 'base64');
    if (type === 'file') {
      buffer = buffer.toString('utf-8');
    }

    try {
      await writeFile(path, buffer);
      const { insertedId } = await dbClient.db
        .collection('files')
        .insertOne(newItem);

      const resultData = {
        userId: uId,
        id: insertedId,
        name,
        type,
        data,
        isPublic: newItem.isPublic,
        parentId: newItem.parentId,
      };
      console.log(resultData);
      return res.status(201).json(resultData);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default FilesController;
