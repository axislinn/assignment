import { ref, onDisconnect, serverTimestamp, onValue, set } from 'firebase/database'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db, rtdb } from '@/lib/firebase/config'

export const setupPresence = (userId: string) => {
  if (!userId) return

  // Create a reference to this user's presence node in Real-time Database
  const userStatusRef = ref(rtdb, `/status/${userId}`)
  const userRef = doc(db, 'users', userId)

  // Create a reference to the last time this user was seen online
  const lastSeenRef = ref(rtdb, `/lastSeen/${userId}`)

  // Write to the real-time database when user goes online/offline
  const connectedRef = ref(rtdb, '.info/connected')

  // Set initial online status in Firestore
  updateDoc(userRef, {
    online: true,
    lastSeen: serverTimestamp()
  }).catch(console.error)

  return onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return
    }

    // When the client's connection state changes...
    onDisconnect(userStatusRef)
      .set('offline')
      .then(() => {
        // Set up last seen update on disconnect
        onDisconnect(lastSeenRef).set(serverTimestamp())
        
        // Update real-time status to 'online'
        set(userStatusRef, 'online')
        
        // Update last seen
        set(lastSeenRef, serverTimestamp())
        
        // Update Firestore user document
        updateDoc(userRef, {
          online: true,
          lastSeen: serverTimestamp()
        }).catch(console.error)
      })
  })
}

export const subscribeToUserPresence = (userId: string, callback: (isOnline: boolean) => void) => {
  if (!userId) {
    callback(false)
    return () => {}
  }

  // Listen to real-time status
  const userStatusRef = ref(rtdb, `/status/${userId}`)
  const unsubscribeRTDB = onValue(userStatusRef, (snapshot) => {
    const isOnline = snapshot.val() === 'online'
    callback(isOnline)
  })

  // Also listen to Firestore as backup
  const unsubscribeFirestore = onSnapshot(doc(db, 'users', userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data()?.online || false)
    } else {
      callback(false)
    }
  })

  // Return cleanup function
  return () => {
    unsubscribeRTDB()
    unsubscribeFirestore()
  }
} 