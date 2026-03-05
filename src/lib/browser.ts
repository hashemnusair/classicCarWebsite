export function isLikelyIOSSafari() {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent
  const isIOS = /iP(ad|hone|od)/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isWebKit = /WebKit/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)

  return isIOS && isWebKit
}
