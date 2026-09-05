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
  },
  async onError(event, error) {
    const message = error?.data?.message || error?.statusMessage || error?.message || 'فشل تسجيل الدخول باستخدام Google'
    const details = error?.data || error?.cause || {}
    return new Response(
      `<!DOCTYPE html><html><body style="font-family: sans-serif; direction: rtl; text-align: center; padding: 2rem;">
        <h1>خطأ في تسجيل الدخول</h1>
        <p>${message}</p>
        <pre>${JSON.stringify(details, null, 2)}</pre>
        <a href="/">العودة للرئيسية</a>
      </body></html>`,
      { status: 500, headers: { 'content-type': 'text/html' } }
    )
  }
})
