import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from administration.models import Campus, Program, Class
from students.models import Student, StudentEnrollment

@pytest.mark.django_db
class TestStudentAPI:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def setup_data(self):
        # Create Users
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        staff_user = User.objects.create_user('staff', 'staff@example.com', 'password', is_staff=True)
        
        # Create Master Data
        campus = Campus.objects.create(name="API Campus")
        program = Program.objects.create(name="API Program")
        class_obj = Class.objects.create(name="C1", campus=campus, program=program, shift="Morning")
        class_obj_2 = Class.objects.create(name="C2", campus=campus, program=program, shift="Evening")
        
        student = Student.objects.create(name="API Student", mobile_number="+92-300-9999999")
        
        return {
            'admin': admin_user, 
            'staff': staff_user,
            'class': class_obj,
            'class_2': class_obj_2,
            'student': student
        }

    def test_enroll_student_action(self, api_client, setup_data):
        api_client.force_authenticate(user=setup_data['admin'])
        
        url = f"/api/students/{setup_data['student'].id}/enroll/"
        payload = {"class_id": setup_data['class'].id}
        
        response = api_client.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert StudentEnrollment.objects.filter(student=setup_data['student'], is_active=True).exists()

    def test_class_change_permission(self, api_client, setup_data):
        # Enroll first
        StudentEnrollment.objects.create(student=setup_data['student'], enrolled_class=setup_data['class'])
        
        url = f"/api/students/{setup_data['student'].id}/change-class/"
        payload = {
            "old_class_id": setup_data['class'].id,
            "new_class_id": setup_data['class_2'].id,
            "reason": "Promotion"
        }
        
        # 1. Staff User -> Forbidden
        api_client.force_authenticate(user=setup_data['staff'])
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # 2. Admin User -> Allowed
        api_client.force_authenticate(user=setup_data['admin'])
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_200_OK
        
        # Verify Logic
        assert StudentEnrollment.objects.filter(student=setup_data['student'], enrolled_class=setup_data['class'], is_active=False).exists()
        assert StudentEnrollment.objects.filter(student=setup_data['student'], enrolled_class=setup_data['class_2'], is_active=True).exists()

    def test_data_preservation_on_delete_attempt(self, api_client, setup_data):
        api_client.force_authenticate(user=setup_data['staff'])
        
        # Try to delete student
        url = f"/api/students/{setup_data['student'].id}/"
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED or response.status_code == status.HTTP_403_FORBIDDEN
        assert Student.objects.filter(id=setup_data['student'].id).exists()
