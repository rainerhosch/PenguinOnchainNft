import { firebase_app } from "../firebaseConfig";
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";

// Get the authentication instance using the Firebase app
const auth = getAuth(firebase_app);

// Function to sign up a user with email and password
export async function signUp(email: string, password: string) {
    // let result = null, // Variable to store the sign-up result
    let error = null; // Variable to store any error that occurs
    let result = null; // Variable to store the sign-up result
    try {
        result = await createUserWithEmailAndPassword(auth, email, password); // Create a new user with email and password
    } catch (e: unknown) {
        error = (e as Error).message; // Get the error message from the caught error
    }
    return { result, error }; // Return the sign-up result and error (if any)
}

// Function to sign in with email and password
export async function signWithGoogle() {
    const provider = new GoogleAuthProvider();
    let result = null, // Variable to store the sign-in result
        error = null; // Variable to store any error that occurs

    try {
        result = await signInWithPopup(auth, provider); // Sign in with email and password
    } catch (e: unknown) {
        error = (e as Error).message; // Catch and store any error that occurs during sign-in
    }

    return { result, error }; // Return the sign-in result and error (if any)
}