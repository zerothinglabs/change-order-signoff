const posthogReady = () => Boolean(window.posthog && window.posthog.__loaded)

export function waitForPosthog(ms) {
  const start = Date.now()

  return new Promise((resolve) => {
    (function check() {
      if (posthogReady()) resolve(true)
      else if (Date.now() - start > ms) resolve(false)
      else setTimeout(check, 50)
    })()
  })
}
