import { ingestDocument } from '../services/ingestionService.js';
import prisma from '../config/db.js';

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const organizationId = req.organizationId;

    const result = await ingestDocument({
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      organizationId,
    });

    res.status(201).json({
      message: 'Document ingested successfully',
      ...result,
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getDocuments(req, res) {
  try {
    const organizationId = req.query.organizationId || 'default-org';

    const documents = await prisma.document.findMany({
      where: { organizationId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        status: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ documents });

  } catch (error) {
    console.error('getDocuments error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    // Find strictly by the unique UUID to bypass any org-matching quirks
    const doc = await prisma.document.findUnique({
      where: { id }
    });
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete all related chunks first (to satisfy Postgres foreign key rules)
    await prisma.documentChunk.deleteMany({ where: { documentId: id } });
    
    // Delete the document itself
    await prisma.document.delete({ where: { id } });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
}