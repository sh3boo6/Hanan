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

  const query = getQuery(event)
  const fileId = query.fileId as string

  if (!fileId) {
    throw createError({ statusCode: 400, statusMessage: 'معرّف الملف مطلوب' })
  }

  const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!fileResponse.ok) {
    throw createError({ statusCode: fileResponse.status, statusMessage: 'فشل في جلب معلومات الملف' })
  }

  const fileMetadata = await fileResponse.json() as { name?: string, mimeType?: string }
  const fileName = fileMetadata.name || 'download'
  const mimeType = fileMetadata.mimeType || 'application/octet-stream'

  const downloadResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!downloadResponse.ok) {
    throw createError({ statusCode: downloadResponse.status, statusMessage: 'فشل في تنزيل الملف' })
  }

  const buffer = Buffer.from(await downloadResponse.arrayBuffer())

  setResponseHeaders(event, {
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    'Content-Length': String(buffer.length)
  })

  return buffer
})
