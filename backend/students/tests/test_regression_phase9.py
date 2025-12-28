from django.test import TestCase
from django.utils import timezone
from students.models import Student, StudentEnrollment
from administration.models import Campus, Program, Class
from students.services import enroll_student, change_class
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

class EnrollmentRegressionTests(TestCase):
    def setUp(self):
        # Setup Master Data
        self.campus = Campus.objects.create(name="Main Campus", capacity=100)
        self.program = Program.objects.create(name="Hifz")
        
        self.class_a = Class.objects.create(
            name="Class A", 
            campus=self.campus, 
            program=self.program, 
            shift='Morning',
            capacity=20
        )
        self.class_b = Class.objects.create(
            name="Class B", 
            campus=self.campus, 
            program=self.program, 
            shift='Morning',
            capacity=20
        )
        
        self.student = Student.objects.create(
            name="Test Student",
            father_name="Father",
            mobile_number="+923001234567"
        )
        
        self.admin = User.objects.create_superuser('admin', 'admin@test.com', 'password')

    def test_prevent_duplicate_enrollment(self):
        """Test that a student cannot be enrolled in the same class twice simultaneously"""
        # 1. Enroll in Class A
        enroll_student(self.student, self.class_a)
        
        # 2. Try to enroll again in Class A
        with self.assertRaises(ValidationError) as cm:
            enroll_student(self.student, self.class_a)
        
        self.assertIn(f"Student is already active in {self.class_a.name}", str(cm.exception))

    def test_allow_rejoining_after_leaving(self):
        """Test that a student CAN rejoin a class if previous enrollment is closed"""
        # 1. Enroll and Leave Class A
        enrollment = enroll_student(self.student, self.class_a)
        enrollment.is_active = False
        enrollment.save()
        
        # 2. Enroll again - Should succeed
        new_enrollment = enroll_student(self.student, self.class_a)
        self.assertTrue(new_enrollment.is_active)
        self.assertEqual(StudentEnrollment.objects.filter(student=self.student, enrolled_class=self.class_a).count(), 2)

    def test_concurrent_enrollment_allowed(self):
        """Test that a student can be in Class A and Class B simultaneously"""
        enroll_student(self.student, self.class_a)
        enroll_student(self.student, self.class_b)
        
        active_enrollments = StudentEnrollment.objects.filter(student=self.student, is_active=True)
        self.assertEqual(active_enrollments.count(), 2)

    def test_change_class_to_duplicate_fails_atomically(self):
        """
        Test changing from A -> B when ALREADY in B.
        Should fail and NOT close A.
        """
        # 1. Enroll in A and B
        enroll_student(self.student, self.class_a)
        enroll_student(self.student, self.class_b)
        
        # 2. Try to transfer from A -> B
        with self.assertRaises(ValidationError):
            change_class(
                self.student, 
                self.class_a.id, 
                self.class_b, 
                "Transfer", 
                self.admin
            )
            
        # 3. Verify state: Still active in BOTH A and B
        self.assertTrue(StudentEnrollment.objects.get(student=self.student, enrolled_class=self.class_a, is_active=True))
        self.assertTrue(StudentEnrollment.objects.get(student=self.student, enrolled_class=self.class_b, is_active=True))

    def test_change_class_success(self):
        """Test successful transfer flow"""
        enroll_student(self.student, self.class_a)
        
        change_class(
            self.student, 
            self.class_a.id, 
            self.class_b, 
            "Promotion", 
            self.admin,
            closure_status="Completed",
            progress_notes="Para 1"
        )
        
        # Verify old is closed
        old = StudentEnrollment.objects.get(student=self.student, enrolled_class=self.class_a)
        self.assertFalse(old.is_active)
        self.assertEqual(old.status, "Completed")
        self.assertEqual(old.progress, "Para 1")
        
        # Verify new is active
        new = StudentEnrollment.objects.get(student=self.student, enrolled_class=self.class_b)
        self.assertTrue(new.is_active)
