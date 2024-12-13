from ninja.security import HttpBearer
from firebase_admin import auth

class FirebaseAuth(HttpBearer):
    def authenticate(self, request):
        try:
            print(request.headers)
            #get token form request header
            token = request.headers.get('Authorization').split('Bearer ')[1]
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            return decoded_token  # Return the decoded token for use in the endpoint
        except Exception:
            return None  # Return None if the token is invalid or verification fails
