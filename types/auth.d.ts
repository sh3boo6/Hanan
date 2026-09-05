declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    picture: string
  }

  interface SecureSessionData {
    tokens: {
      access_token: string
      refresh_token?: string
      expires_in?: number
      token_type?: string
      scope?: string
    }
  }
}

export {}
