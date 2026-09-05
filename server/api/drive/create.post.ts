interface DriveTokens {
  access_token: string
}

interface DriveSecureSession {
  tokens: DriveTokens
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const accessToken = (session.secure as DriveSecureSession | undefined)?.tokens?.access_token

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'غير مصرح بالدخول' })
  }

  const body = await readBody(event)
  const { name, type, folderId } = body // تم حذف content

  const parentFolder = folderId || 'root'

  let mimeType = 'application/vnd.google-apps.folder'
  if (type === 'file') {
    mimeType = 'text/plain'
  }

  const metadata = {
    name,
    mimeType,
    parents: [parentFolder]
  }

  const response = await $fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  })

  return response
})
