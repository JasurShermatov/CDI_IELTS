from django.urls import path
from . import views

urlpatterns = [
    path("all-tests/", views.all_tests, name="all-tests"),
    path("purchase/<uuid:test_id>/", views.purchase_test_api, name="purchase-test"),
    path("my-tests/", views.my_tests, name="my-tests"),
    path("results/", views.my_results, name="my-results"),
]
