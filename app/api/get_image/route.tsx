// app/api/get_image/route.ts - NO COMPRESSION, just serve the file
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    
    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID parameter is required' },
        { status: 400 }
      );
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

    const key = `uploads/${uuid}`;

    // Check if the object exists
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME!,
        Key: key,
      }));
    } catch (headError) {
      console.error('Image not found:', headError);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Get the image from S3 (already compressed during upload)
    const { Body, ContentType } = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
    }));

    if (!Body) {
      return NextResponse.json(
        { error: 'No image data found' },
        { status: 404 }
      );
    }

    // Convert the stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of Body as any) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    // Serve the already-compressed image WITHOUT recompressing
    const response = new NextResponse(imageBuffer);
    response.headers.set('Content-Type', ContentType || 'image/jpeg');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Content-Disposition', 'inline');

    return response;

  } catch (error) {
    console.error('Image retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    );
  }
}