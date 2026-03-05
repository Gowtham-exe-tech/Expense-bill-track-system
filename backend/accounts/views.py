from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'role': user.role,
                'department': user.department,
                'username': user.username,
            },
            status=status.HTTP_200_OK,
        )


class MeAPIView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'department': user.department,
            },
            status=status.HTTP_200_OK,
        )
