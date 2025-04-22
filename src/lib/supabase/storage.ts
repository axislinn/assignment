import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadResult {
  url: string
  path: string
}

export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'marketplace',
  folder: string = 'product-images'
): Promise<UploadResult> {
  try {
    // Validate file
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size is 5MB.')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    console.log('Attempting to upload file:', {
      bucket,
      filePath,
      fileType: file.type,
      fileSize: file.size
    })

    // Upload file with metadata
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error details:', {
        error: uploadError,
        bucket,
        filePath,
        fileType: file.type,
        fileSize: file.size
      })
      throw new Error(`Error uploading image: ${uploadError.message}`)
    }

    console.log('File uploaded successfully:', {
      bucket,
      filePath,
      uploadData
    })

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to retrieve public URL.')
    }

    return {
      url: publicUrlData.publicUrl,
      path: filePath
    }
  } catch (error: any) {
    console.error('Upload failed:', {
      error: error.message || error,
      bucket,
      fileType: file.type,
      fileSize: file.size
    })
    throw error
  }
}

export async function deleteImageFromSupabase(
  path: string,
  bucket: string = 'marketplace'
): Promise<void> {
  try {
    console.log('Attempting to delete file:', {
      bucket,
      path
    })

    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error details:', {
        error,
        bucket,
        path
      })
      throw new Error(`Error deleting image: ${error.message}`)
    }

    console.log('File deleted successfully:', {
      bucket,
      path
    })
  } catch (error: any) {
    console.error('Delete failed:', {
      error: error.message || error,
      bucket,
      path
    })
    throw error
  }
}

export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'marketplace',
  folder: string = 'product-images'
): Promise<UploadResult[]> {
  try {
    console.log('Attempting to upload multiple files:', {
      bucket,
      folder,
      fileCount: files.length
    })

    const uploadPromises = files.map(file => 
      uploadImageToSupabase(file, bucket, folder)
    )
    
    const results = await Promise.all(uploadPromises)
    
    console.log('Multiple files uploaded successfully:', {
      bucket,
      folder,
      fileCount: files.length,
      results
    })

    return results
  } catch (error: any) {
    console.error('Multiple upload failed:', {
      error: error.message || error,
      bucket,
      folder,
      fileCount: files.length
    })
    throw error
  }
} 