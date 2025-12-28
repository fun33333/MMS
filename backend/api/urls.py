from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import CampusViewSet, ProgramViewSet, ClassViewSet, StudentViewSet, DashboardStatsView, UserMeView

router = DefaultRouter()
router.register(r'campuses', CampusViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'students', StudentViewSet)

from api.serializers_auth import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserMeView.as_view(), name='user_me'),
]
