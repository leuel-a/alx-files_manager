import { checkRedisToken } from '../utils/authorize';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const { error, userId } = await checkRedisToken(req);

    if (error) return res.status(401).send({ error });

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

    return res.status(401).json({ ...newEntity, id });
  }
}

export default FilesController;
