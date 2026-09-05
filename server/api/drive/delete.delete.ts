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

  // حذف العنصر (ملف أو مجلد) من Google Drive
  await $fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  return { success: true }
})
