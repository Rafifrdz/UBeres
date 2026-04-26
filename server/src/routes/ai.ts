import { Router } from 'express';
import { polishDescription } from '../lib/ai';

const router = Router();

router.post('/polish', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Deskripsi wajib diisi' });
  }

  try {
    const polished = await polishDescription(description);
    return res.json({ data: polished });
  } catch (error) {
    console.error('API Polish Error:', error);
    return res.status(500).json({ error: 'Gagal memproses AI Polish' });
  }
});

export default router;
