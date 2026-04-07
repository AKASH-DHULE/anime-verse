export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/wrong-password':
      return '❌ Incorrect password. Please try again or reset it below.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Try signing up!';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/invalid-credential':
      return 'Incorrect email or password. You can reset your password below.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
