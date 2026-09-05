export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive.file']
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      secure: {
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          scope: tokens.scope
        }
      },
      loggedInAt: new Date()
    })

    throw createError({ statusCode: 302, statusMessage: 'Redirect', redirectURL: '/' })
  },
  async onError(event, error) {
    console.error('Google OAuth error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'فشل تسجيل الدخول باستخدام Google',
      cause: error
    })
  }
})
