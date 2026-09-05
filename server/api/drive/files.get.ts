interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime?: string
  webViewLink?: string
  shared?: boolean
  permissions?: unknown[]
}

interface DriveFileListResponse {
  files?: DriveFile[]
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const accessToken = session.secure?.tokens?.access_token || session.secure?.accessToken

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'غير مصرح بالدخول' })
  }

  const query = getQuery(event)
  const folderId = (query.folderId as string) || 'root'

  const q = `'${folderId}' in parents and trashed = false`

  const response = await $fetch<DriveFileListResponse>('https://www.googleapis.com/drive/v3/files', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    query: {
      q,
      pageSize: 50,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, shared, permissions)',
      orderBy: 'folder, name'
    }
  })

  return { files: response.files || [] }
})
