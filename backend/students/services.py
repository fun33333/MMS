from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from students.models import Student, StudentEnrollment

def enroll_student(student, enrolled_class):
    """
    Enrolls a student in a class.
    Validates that the student is not already active in the SAME class.
    """
    # Check for existing active enrollment in THE SAME CLASS
    if StudentEnrollment.objects.filter(student=student, enrolled_class=enrolled_class, is_active=True).exists():
        raise ValidationError(f"Student is already active in {enrolled_class.name}.")

    enrollment = StudentEnrollment(student=student, enrolled_class=enrolled_class)
    enrollment.full_clean()
    enrollment.save()
    return enrollment

@transaction.atomic
def change_class(student, old_class_id, new_class, reason, user, closure_status='Transferred', progress_notes=''):
    """
    Changes a student's class.
    1. Deactivates old enrollment (sets end_date=now, status, progress)
    2. Creates new enrollment
    """
    # 1. Find active enrollment for the old class
    # Safe lookup: if multiple exist (due to bug), take the most recent one
    current_enrollment = StudentEnrollment.objects.filter(
        student=student, 
        enrolled_class_id=old_class_id, 
        is_active=True
    ).order_by('-start_date').first()

    if not current_enrollment:
        raise ValidationError("No active enrollment found for this class.")

    # 2. Deactivate old
    current_enrollment.is_active = False
    current_enrollment.end_date = timezone.now().date()
    current_enrollment.status = closure_status
    current_enrollment.progress = progress_notes
    current_enrollment.save()

    # 3. Create new
    new_enrollment = enroll_student(student, new_class)
    
    # Audit logging hook (future)
    
    return new_enrollment

def deactivate_student(student, reason, user):
    """
    Soft deletes a student and all their active enrollments.
    """
    with transaction.atomic():
        student.status = 'Left'
        student.remarks += f" [Deactivated by {user}: {reason}]"
        student.save()
        
        # Deactivate all active enrollments
        active_enrollments = StudentEnrollment.objects.filter(student=student, is_active=True)
        for enrollment in active_enrollments:
            enrollment.is_active = False
            enrollment.end_date = timezone.now().date()
            enrollment.save()
