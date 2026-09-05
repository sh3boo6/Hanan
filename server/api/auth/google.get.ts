import { send } from 'h3'

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

    // 🟢 استخدام send من h3 لتجنب تعارض أنواع TypeScript مع onSuccess
    const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/">
          <script>window.location.href = "/";</script>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <p>جاري تحويلك إلى التطبيق...</p>
        </body>
      </html>`

    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    await send(event, html)
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
