from rest_framework import serializers
from students.models import Student, StudentEnrollment
from api.serializers_admin import ClassSerializer

class StudentEnrollmentSerializer(serializers.ModelSerializer):
    enrolled_class_details = ClassSerializer(source='enrolled_class', read_only=True)

    class Meta:
        model = StudentEnrollment
        fields = ['id', 'student', 'enrolled_class', 'enrolled_class_details', 'start_date', 'end_date', 'is_active']
        read_only_fields = ['is_active', 'start_date', 'end_date']

class StudentSerializer(serializers.ModelSerializer):
    # Show active enrollments directly on student object
    active_enrollments = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'father_name', 'cnic', 'mobile_number', 
            'address', 'admission_date', 'status', 'remarks', 
            'active_enrollments', 'history', 'created_at'
        ]

    def get_active_enrollments(self, obj):
        active = obj.enrollments.filter(is_active=True)
        return StudentEnrollmentSerializer(active, many=True).data

    def get_history(self, obj):
        # Return all enrollments ordered by start_date desc
        history = obj.enrollments.all().order_by('-start_date')
        return StudentEnrollmentSerializer(history, many=True).data
