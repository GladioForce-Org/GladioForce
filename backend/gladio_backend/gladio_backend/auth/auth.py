from ninja.security import HttpBearer
from firebase_admin import auth

class FirebaseAuth(HttpBearer):
    def authenticate(self, request, token: str):
        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            return decoded_token  # Return the decoded token for use in the endpoint
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None  # Return None if the token is invalid or verification fails