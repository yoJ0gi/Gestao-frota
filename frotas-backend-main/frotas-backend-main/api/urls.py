from rest_framework.routers import DefaultRouter
from .views import MotoristaViewSet, VeiculoViewSet

router = DefaultRouter()
router.register(r'motoristas', MotoristaViewSet)
router.register(r'veiculos', VeiculoViewSet)

urlpatterns = router.urls