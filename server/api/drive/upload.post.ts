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

  // قراءة كافة الحقول المرسلة في Multipart Form Data
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'لم يتم اختيار أي ملف' })
  }

  // استخراج الملف و folderId
  const fileItem = formData.find(item => item.name === 'file')
  const folderIdItem = formData.find(item => item.name === 'folderId')

  if (!fileItem || !fileItem.data) {
    throw createError({ statusCode: 400, statusMessage: 'ملف غير صالح' })
  }

  // تحويل folderId القادم وإذا كان 'root' أو غير موجود نستخدم 'root'
  const targetFolderId = folderIdItem?.data?.toString('utf-8') || 'root'

  // إعداد بيانات الميتاداتا لـ Google Drive
  const metadata = {
    name: fileItem.filename || 'file',
    mimeType: fileItem.type || 'application/octet-stream',
    parents: [targetFolderId] // 👈 إدراج المجلد المستهدف هنا
  }

  // استخدام Multipart Boundary لإرسال الملف مع الميتاداتا في طلب واحد
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const multipartRequestBody = Buffer.concat([
    Buffer.from(
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
    ),
    Buffer.from(`\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`),
    fileItem.data,
    Buffer.from(closeDelimiter)
  ])

  // رفع الملف باستخدام multipart/related
  const response = await $fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  })

  return response
})
