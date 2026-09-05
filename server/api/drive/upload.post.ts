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

  const metadata = {
    name: fileItem.filename || 'file',
    mimeType: fileItem.type || 'application/octet-stream',
    parents: [targetFolderId]
  }

  // إعداد الـ Boundary بشكل دقيق متوافق مع Google Drive API
  const boundary = '----WebKitFormBoundary3141592653589793'

  const headerPart = Buffer.from(
    `--${boundary}\r\n`
    + 'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    + `${JSON.stringify(metadata)}\r\n`
    + `--${boundary}\r\n`
    + `Content-Type: ${metadata.mimeType}\r\n\r\n`
  )

  const footerPart = Buffer.from(`\r\n--${boundary}--`)

  // دمج البيانات بالترتيب الصحيح
  const multipartRequestBody = Buffer.concat([
    headerPart,
    fileItem.data,
    footerPart
  ])

  try {
    const response = await $fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': multipartRequestBody.length.toString()
      },
      body: multipartRequestBody
    })

    return response
  } catch (err: unknown) {
    const errorObj = err as { statusCode?: number, data?: { error?: { message?: string } } }

    throw createError({
      statusCode: errorObj.statusCode || 500,
      statusMessage: errorObj.data?.error?.message || 'فشل في رفع الملف إلى Google Drive'
    })
  }
})
