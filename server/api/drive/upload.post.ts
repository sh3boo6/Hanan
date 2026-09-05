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

  // نقرأ فقط اسم الملف، حجمه، ونوعه من الـ JSON
  const body = await readBody(event)
  const { name, mimeType, size, folderId } = body || {}

  if (!name || !size) {
    throw createError({ statusCode: 400, statusMessage: 'بيانات الملف غير مكتملة' })
  }

  try {
    // طلب جلسة رفع من Google Drive مباشرة
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
      throw createError({
        statusCode: sessionResponse.status,
        statusMessage: 'فشل في إنشاء جلسة رفع الملفات مع Google'
      })
    }

    const uploadUrl = sessionResponse.headers.get('location')
    if (!uploadUrl) {
      throw createError({ statusCode: 500, statusMessage: 'لم يتم استلام رابط الرفع' })
    }

    // نرجع الرابط المباشر للمتصفح
    return { uploadUrl }
  } catch (err: unknown) {
    const errorObj = err as { statusCode?: number, message?: string }
    throw createError({
      statusCode: errorObj.statusCode || 500,
      statusMessage: errorObj.message || 'حدث خطأ أثناء إعداد الرفع'
    })
  }
})
