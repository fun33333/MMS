from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from administration.models import Campus, Program, Class
from students.models import Student, StudentEnrollment
from students import services

from api.serializers_admin import CampusSerializer, ProgramSerializer, ClassSerializer
from api.serializers_student import StudentSerializer, StudentEnrollmentSerializer
from api.permissions import IsStaffUser

class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.filter(is_active=True)
    serializer_class = CampusSerializer
    permission_classes = [IsStaffUser]

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = [IsStaffUser]

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.filter(is_active=True)
    serializer_class = ClassSerializer
    permission_classes = [IsStaffUser]

class StudentViewSet(viewsets.ModelViewSet):
    """
    Main ViewSet for Student Management.
    Standard CRUD + Custom Business Logic Actions.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsStaffUser]

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, pk=None):
        """
        Enroll student in a class.
        Expected Payload: { "class_id": 1 }
        """
        student = self.get_object()
        class_id = request.data.get('class_id')
        
        if not class_id:
            return Response({"error": "class_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        enrolled_class = get_object_or_404(Class, pk=class_id)
        
        try:
            enrollment = services.enroll_student(student, enrolled_class)
            return Response(StudentEnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='change-class')
    def change_class(self, request, pk=None):
        """
        Change student class (Archive old -> Create New).
        Expected Payload: { 
            "old_class_id": 1, 
            "new_class_id": 2, 
            "reason": "Promoted",
            "closure_status": "Completed" | "Transferred" (Optional),
            "progress_notes": "Para 3..." (Optional)
        }
        """
        student = self.get_object()
        old_class_id = request.data.get('old_class_id')
        new_class_id = request.data.get('new_class_id')
        reason = request.data.get('reason')
        closure_status = request.data.get('closure_status', 'Transferred')
        progress_notes = request.data.get('progress_notes', '')

        if not all([old_class_id, new_class_id, reason]):
            return Response({"error": "old_class_id, new_class_id, and reason are required"}, status=status.HTTP_400_BAD_REQUEST)

        new_class = get_object_or_404(Class, pk=new_class_id)

        try:
            enrollment = services.change_class(
                student=student,
                old_class_id=old_class_id,
                new_class=new_class,
                reason=reason,
                user=request.user,
                closure_status=closure_status,
                progress_notes=progress_notes
            )
            return Response(StudentEnrollmentSerializer(enrollment).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """
        Soft delete student.
        Expected Payload: { "reason": "Left" }
        """
        student = self.get_object()
        reason = request.data.get('reason')

        if not reason:
            return Response({"error": "Reason is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Permission Check: Only Admins can deactivate
        # TODO: Re-enable after implementing authentication (Phase 8)
        # if not request.user.is_superuser:
        #      return Response({"error": "Only Admins can deactivate students."}, status=status.HTTP_403_FORBIDDEN)

        services.deactivate_student(student, reason, request.user)
        return Response({"status": "Student deactivated successfully"}, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from django.db.models import Count, Q

class DashboardStatsView(APIView):
    """
    Dashboard statistics endpoint.
    Returns aggregated data for the dashboard widgets.
    """
    permission_classes = [IsStaffUser]

    def get(self, request):
        # Student Stats
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='Active').count()
        left_students = Student.objects.filter(status='Left').count()
        
        # Enrollment Stats
        active_enrollments = StudentEnrollment.objects.filter(is_active=True).count()
        
        # Campus Stats with student counts
        campus_stats = []
        for campus in Campus.objects.filter(is_active=True):
            student_count = StudentEnrollment.objects.filter(
                enrolled_class__campus=campus,
                is_active=True
            ).values('student').distinct().count()
            campus_stats.append({
                "id": campus.id,
                "name": campus.name,
                "student_count": student_count,
                "capacity": campus.capacity
            })
        
        # Program Stats with student counts
        program_stats = []
        for program in Program.objects.filter(is_active=True):
            student_count = StudentEnrollment.objects.filter(
                enrolled_class__program=program,
                is_active=True
            ).values('student').distinct().count()
            program_stats.append({
                "id": program.id,
                "name": program.name,
                "student_count": student_count
            })
        
        # Class count
        total_classes = Class.objects.filter(is_active=True).count()
        total_campuses = Campus.objects.filter(is_active=True).count()
        total_programs = Program.objects.filter(is_active=True).count()

        return Response({
            "students": {
                "total": total_students,
                "active": active_students,
                "left": left_students
            },
            "enrollments": {
                "active": active_enrollments
            },
            "counts": {
                "classes": total_classes,
                "campuses": total_campuses,
                "programs": total_programs
            },
            "campus_breakdown": campus_stats,
            "program_breakdown": program_stats
        })

from rest_framework.permissions import IsAuthenticated

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "isAdmin": request.user.is_superuser,
            "isStaff": request.user.is_staff
        })

