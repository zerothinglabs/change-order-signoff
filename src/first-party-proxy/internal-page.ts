export const internalPage = (on: boolean) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="noindex">
  <title>Internal browser · SignedExtra</title>
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../app.css">
</head>
<body>
  <main class="container page stack-sm">
    <h1>${on ? 'This browser is marked internal' : 'This browser counts again'}</h1>
    <p>${on ? 'Its visits and events no longer reach hq or PostHog. The mark is a cookie, so clearing cookies removes it.' : 'Its visits and events reach hq and PostHog again.'}</p>
    <p><a class="link" href="${on ? 'internal?off=1' : 'internal'}">${on ? 'Count this browser again' : 'Mark this browser internal'}</a></p>
    <p><a class="link" href="../">Go to the home page</a></p>
  </main>
  <script src="../zt.js"></script>
</body>
</html>`
