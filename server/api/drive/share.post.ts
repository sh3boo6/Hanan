interface PermissionItem {
  id: string
  type: string
  role: string
}

interface PermissionsListResponse {
  permissions?: PermissionItem[]
}

interface GoogleApiErrorResponse {
  statusCode?: number
  data?: {
    error?: {
      message?: string
    }
  }
}

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
  const { fileId, accessType, role } = body

  const roleMap: Record<string, string> = {
    viewer: 'reader',
    commenter: 'commenter',
    editor: 'writer'
  }

  const targetRole = roleMap[role as string] || 'reader'

  try {
    if (accessType === 'anyone') {
      const permissionsRes = await $fetch<PermissionsListResponse>(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      const existingAnyone = (permissionsRes.permissions || []).find(p => p.type === 'anyone')

      if (existingAnyone) {
        return await $fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${existingAnyone.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: targetRole })
          }
        )
      } else {
        return await $fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: targetRole,
            type: 'anyone'
          })
        })
      }
    } else if (accessType === 'restricted') {
      const permissionsRes = await $fetch<PermissionsListResponse>(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      const existingAnyone = (permissionsRes.permissions || []).find(p => p.type === 'anyone')

      if (existingAnyone) {
        await $fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${existingAnyone.id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        )
      }

      return { success: true }
    }
  } catch (error: unknown) {
    const err = error as GoogleApiErrorResponse
    console.error('Google Drive Permissions Error:', err?.data || err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.data?.error?.message || 'فشل في تعديل صلاحيات المشاركة'
    })
  }
})
