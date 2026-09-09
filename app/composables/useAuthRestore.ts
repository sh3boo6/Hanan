export const useAuthRestore = () => {
  const { ready, loggedIn, user, fetch } = useUserSession()

  const restore = async () => {
    if (import.meta.client) {
      try {
        await fetch()
      } catch {
        // ignore
      }
    }
  }

  return { restore, ready, loggedIn, user }
}
