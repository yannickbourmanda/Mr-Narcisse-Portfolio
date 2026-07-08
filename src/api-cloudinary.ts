import express from 'express';
// We'll require 'cloudinary' dynamically or use fetch to their REST API
import crypto from 'crypto';

export const cloudinaryRouter = express.Router();

cloudinaryRouter.post('/delete', async (req, res) => {
  const { publicId } = req.body;
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(200).json({ status: 'ignored', message: 'Cloudinary credentials not configured' });
  }

  try {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: publicId,
        api_key: apiKey,
        timestamp,
        signature
      })
    });
    
    // Also try to destroy video in case it was a video
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: publicId,
        api_key: apiKey,
        timestamp,
        signature
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

cloudinaryRouter.post('/rename-folder', async (req, res) => {
    // Cloudinary Admin API requires Basic Auth
    const { oldFolder, newFolder } = req.body;
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(200).json({ status: 'ignored', message: 'Cloudinary credentials not configured' });
    }
    
    try {
        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/folders/${oldFolder}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ to_folder: newFolder })
        });
        const data = await response.json();
        res.json(data);
    } catch(error: any) {
        res.status(500).json({ error: error.message });
    }
});
