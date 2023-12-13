import { checkRedisToken } from '../utils/authorize';
import dbClient from '../utils/db';
import { validatePostRequest } from '../utils/filesRequestValidators';

class FilesController {
  static async postUpload(req, res) {
    // Validate the token and get the user ID
    const { error: e, userId } = await checkRedisToken(req);
    if (e) return res.status(401).send({ error: e });

    const { error } = await validatePostRequest(req);
    if (error) return res.status(400).json({ error });

    // prettier-ignore
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;

    const newEntity = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    let id;
    if (type === 'folder') {
      const { insertedId } = await dbClient.createFolder({ ...newEntity });
      id = insertedId;
    } else {
      const { insertedId } = await dbClient.addFileEntity({
        ...newEntity,
        data,
      });
      id = insertedId;
    }

    return res.status(201).json({ ...newEntity, id });
  }
}

export default FilesController;
