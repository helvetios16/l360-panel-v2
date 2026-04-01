import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)

// Connect to emulators if enabled
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
	if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL) {
		connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL)
	}

	if (
		import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_HOST &&
		import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT
	) {
		connectDatabaseEmulator(
			db,
			import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_HOST,
			parseInt(import.meta.env.VITE_FIREBASE_DATABASE_EMULATOR_PORT),
		)
	}
}

export { auth, db }
export default app
