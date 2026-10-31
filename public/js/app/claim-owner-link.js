const ownerLink = /^#k=([A-Za-z0-9_-]{20,})/.exec(location.hash)

if (ownerLink) {
  localStorage.setItem('ownerToken', ownerLink[1])
  history.replaceState(null, '', location.pathname + location.search)
}
