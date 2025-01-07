import logging
from django.http import JsonResponse
from firebase_admin import auth

logger = logging.getLogger(__name__)

def firebase_token_required(get_response):
    def middleware(request):
        # print('Middleware executed')
        # logger.info('Firebase middleware triggered')
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            id_token = auth_header.split(' ')[1]  # Extract the token part
            try:
                decoded_token = auth.verify_id_token(id_token)
                request.firebase_user = decoded_token  # Attach user info to the request
                logger.info(f'User authenticated: {decoded_token}')
            except Exception as e:
                logger.error(f'Invalid or expired token: {e}')
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
        else:
            logger.warning('Authorization header missing')
            return JsonResponse({'error': 'Authorization header missing'}, status=401)

        return get_response(request)

    return middleware
