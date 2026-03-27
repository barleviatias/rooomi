import { isNative, isIOS, isAndroid } from '../platform'
import { registerPushToken } from './notifications'

let removeListeners: (() => void) | null = null

async function initNativePush(userId: string) {
  const { PushNotifications } = await import('@capacitor/push-notifications')

  const permResult = await PushNotifications.checkPermissions()
  if (permResult.receive === 'prompt') {
    const reqResult = await PushNotifications.requestPermissions()
    if (reqResult.receive !== 'granted') return
  } else if (permResult.receive !== 'granted') {
    return
  }

  await PushNotifications.register()

  const registrationListener = await PushNotifications.addListener('registration', async (token) => {
    const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'web'
    await registerPushToken(userId, token.value, platform)
  })

  const foregroundListener = await PushNotifications.addListener('pushNotificationReceived', () => {})

  const tapListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const actionUrl = action.notification.data?.action_url
    if (typeof actionUrl === 'string' && actionUrl.startsWith('/')) {
      window.location.href = actionUrl
    }
  })

  removeListeners = () => {
    registrationListener.remove()
    foregroundListener.remove()
    tapListener.remove()
  }
}

async function initWebPush(_userId: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

export async function initPushNotifications(userId: string) {
  if (isNative) {
    await initNativePush(userId)
  } else {
    await initWebPush(userId)
  }
}

export async function teardownPushNotifications() {
  if (removeListeners) {
    removeListeners()
    removeListeners = null
  }
}
