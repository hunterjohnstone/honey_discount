// app/api/upload-file/route.ts - Improved compression settings
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // HIGH QUALITY compression settings
    let processedBuffer: Buffer;
    let processedType = file.type;
    
    try {
      processedBuffer = await sharp(buffer)
        .resize({
          width: 1920, // Higher max width for better quality
          height: 1920, // Higher max height
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3 // Higher quality resizing
        })
        .jpeg({ 
          quality: 90, // Increased from 80 to 90
          progressive: true,
          chromaSubsampling: '4:4:4', // Better color quality
          optimiseScans: true,
          mozjpeg: true // Use MozJPEG for better compression
        })
        .toBuffer();
      
      processedType = 'image/jpeg';
      
    } catch (compressionError) {
      console.warn('Compression failed, using original:', compressionError);
      processedBuffer = buffer;
    }

    const s3Client = new S3Client({
      region: process.env.B2_REGION!,
      endpoint: process.env.NEXT_PUBLIC_B2_URL!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
      },
    });

    const uploadParams = {
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: `uploads/${title}`,
      Body: processedBuffer,
      ContentType: processedType,
      Metadata: {
        originalName: file.name,
        originalSize: buffer.length.toString(),
        compressedSize: processedBuffer.length.toString(),
        compressionRatio: ((processedBuffer.length / buffer.length) * 100).toFixed(2) + '%',
        quality: '90' // Track the quality setting
      }
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${uploadParams.Bucket}.${process.env.B2_REGION}.backblazeb2.com/${uploadParams.Key}`;

    return NextResponse.json(
      { 
        url: fileUrl, 
        message: 'File uploaded with high quality compression',
        originalSize: buffer.length,
        compressedSize: processedBuffer.length,
        compressionRatio: ((processedBuffer.length / buffer.length) * 100).toFixed(2) + '%'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}