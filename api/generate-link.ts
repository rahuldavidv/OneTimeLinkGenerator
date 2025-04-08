import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB, getDB } from '../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Connect to MongoDB
    await connectDB()
    const db = await getDB()

    // Get file data from request
    const { name, size, type } = req.body
    const file = req.files?.file

    if (!file || !name || !size || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create a new file document
    const result = await db.collection('files').insertOne({
      name,
      size: parseInt(size),
      type,
      fileData: file.data,
      downloadCount: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date()
    })

    // Return the file ID for the download link
    return res.status(200).json({ id: result.insertedId })
  } catch (error) {
    console.error('Error generating link:', error)
    return res.status(500).json({ error: 'Failed to generate link' })
  }
} 