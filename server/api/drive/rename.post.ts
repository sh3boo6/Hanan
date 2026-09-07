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
  const { fileId, name } = body

  if (!fileId || !name) {
    throw createError({ statusCode: 400, statusMessage: 'بيانات غير صالحة' })
  }

  try {
    await $fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number, message?: string }
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.message || 'فشل في إعادة تسمية الملف'
    })
  }
})
