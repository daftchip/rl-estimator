const { handleUpload } = require('@vercel/blob/client');

// Token-generation endpoint for client-side (browser -> Blob storage) uploads.
// This lets large PDFs skip Vercel's 4.5MB serverless request-body limit:
// the browser uploads the PDF straight to Blob storage, and /api/analyse
// is then given a blobUrl to fetch it from instead of inline base64.
//
// Uses the Web-standard Request/Response signature (single argument) rather
// than the Node (req, res) style used by api/analyse.js and api/compare.js —
// this is the form @vercel/blob's handleUpload expects outside Next.js.
module.exports = async function handler(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['application/pdf'],
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB, plenty for a PDF drawing
          tokenPayload: JSON.stringify({})
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('blob upload completed', blob.url);
      }
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};
