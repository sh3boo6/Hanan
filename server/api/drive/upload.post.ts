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

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'لم يتم اختيار أي ملف' })
  }

  const fileItem = formData.find(item => item.name === 'file')
  const folderIdItem = formData.find(item => item.name === 'folderId')

  if (!fileItem || !fileItem.data) {
    throw createError({ statusCode: 400, statusMessage: 'ملف غير صالح' })
  }

  const targetFolderId = folderIdItem?.data?.toString('utf-8') || 'root'
  const fileName = fileItem.filename || 'file'
  const mimeType = fileItem.type || 'application/octet-stream'

  try {
    // 1. إنشاء جلسة رفع Resumable للحصول على رابط الرفع المباشر
    const sessionResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': fileItem.data.length.toString()
        },
        body: JSON.stringify({
          name: fileName,
          parents: [targetFolderId]
        })
      }
    )

    if (!sessionResponse.ok) {
      throw createError({
        statusCode: sessionResponse.status,
        statusMessage: 'فشل في إنشاء جلسة رفع الملفات'
      })
    }

    // استخراج رابط الرفع التراكمي
    const uploadUrl = sessionResponse.headers.get('location')
    if (!uploadUrl) {
      throw createError({ statusCode: 500, statusMessage: 'لم يتم استلام رابط الرفع' })
    }

    // 2. إرسال بيانات الملف مباشرة عبر رابط الجلسة
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileItem.data.length.toString()
      },
      body: fileItem.data
    })

    if (!uploadResponse.ok) {
      throw createError({
        statusCode: uploadResponse.status,
        statusMessage: 'فشل أثناء رفع محتوى الملف'
      })
    }

    const result = await uploadResponse.json()
    return result
  } catch (err: unknown) {
    const errorObj = err as { statusCode?: number, message?: string }
    throw createError({
      statusCode: errorObj.statusCode || 500,
      statusMessage: errorObj.message || 'حدث خطأ غير متوقع أثناء الرفع'
    })
  }
})
