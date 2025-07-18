from urllib.parse import parse_qs
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user(token_key):
    try:
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.authentication import JWTAuthentication

        validated_token = JWTAuthentication().get_validated_token(token_key)
        return JWTAuthentication().get_user(validated_token)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        token = parse_qs(query_string).get("token")

        if token:
            scope["user"] = await get_user(token[0])
        else:
            from django.contrib.auth.models import AnonymousUser

            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
