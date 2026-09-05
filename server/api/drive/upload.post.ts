import { readMultipartFormData } from 'h3'

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

  // 1. إجراء إنشاء الجلسة أولاً (Initial Session)
  const query = getQuery(event)
  if (query.action === 'create-session') {
    const body = await readBody(event)
    const { name, mimeType, size, folderId } = body || {}

    const sessionResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType || 'application/octet-stream',
          'X-Upload-Content-Length': size.toString()
        },
        body: JSON.stringify({
          name,
          parents: [folderId || 'root']
        })
      }
    )

    if (!sessionResponse.ok) {
      throw createError({ statusCode: sessionResponse.status, statusMessage: 'فشل في إنشاء جلسة الرفع' })
    }

    const uploadUrl = sessionResponse.headers.get('location')
    return { uploadUrl }
  }

  // 2. تمرير الجزء (Chunk Proxy) لتفادي مشكلة CORS
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'بيانات غير صالحة' })
  }

  const chunkItem = formData.find(item => item.name === 'chunk')
  const uploadUrlItem = formData.find(item => item.name === 'uploadUrl')
  const contentRangeItem = formData.find(item => item.name === 'contentRange')

  if (!chunkItem || !uploadUrlItem || !contentRangeItem) {
    throw createError({ statusCode: 400, statusMessage: 'بيانات الجزء غير مكتملة' })
  }

  const uploadUrl = uploadUrlItem.data.toString('utf-8')
  const contentRange = contentRangeItem.data.toString('utf-8')

  try {
    const googleRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': chunkItem.data.length.toString(),
        'Content-Range': contentRange
      },
      body: chunkItem.data
    })

    if (!googleRes.ok && googleRes.status !== 308) {
      throw createError({ statusCode: googleRes.status, statusMessage: 'فشل في إرسال الجزء' })
    }

    return { status: googleRes.status, message: 'Chunk uploaded successfully' }
  } catch (err: unknown) {
    const errorObj = err as { statusCode?: number, message?: string }
    throw createError({
      statusCode: errorObj.statusCode || 500,
      statusMessage: errorObj.message || 'خطأ في الخادم أثناء نقل الجزء'
    })
  }
})
