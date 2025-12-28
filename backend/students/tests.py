import pytest
from django.core.exceptions import ValidationError
from administration.models import Campus, Program, Class
from students.models import Student, StudentEnrollment

@pytest.mark.django_db
class TestStudentModels:
    
    @pytest.fixture
    def setup_data(self):
        campus = Campus.objects.create(name="Test Campus")
        prog_nazra = Program.objects.create(name="Nazra")
        prog_hifz = Program.objects.create(name="Hifz")
        
        class_nazra = Class.objects.create(name="N1", campus=campus, program=prog_nazra, shift="Morning")
        class_hifz = Class.objects.create(name="H1", campus=campus, program=prog_hifz, shift="Evening")
        
        return {
            'campus': campus,
            'prog_nazra': prog_nazra, # Fixed variable name
            'prog_hifz': prog_hifz,
            'class_nazra': class_nazra,
            'class_hifz': class_hifz
        }

    def test_student_creation_validation(self):
        # Valid Student
        student = Student.objects.create(
            name="Ali",
            father_name="Ahmed",
            mobile_number="+92-300-1234567"
        )
        assert student.status == "Active"

        # Invalid Phone
        with pytest.raises(ValidationError):
            s = Student(name="Bad", father_name="Guy", mobile_number="03001234567")
            s.full_clean()

        # Invalid CNIC
        with pytest.raises(ValidationError):
            s = Student(name="Bad", father_name="Guy", mobile_number="+92-300-1234567", cnic="12345")
            s.full_clean()

    def test_multiple_program_enrollment(self, setup_data):
        student = Student.objects.create(name="Multi", father_name="Tasker", mobile_number="+92-300-1111111")
        
        # 1. Enroll in Nazra
        e1 = StudentEnrollment.objects.create(student=student, enrolled_class=setup_data['class_nazra'])
        
        # 2. Enroll in Hifz (Should be allowed - Different Program)
        e2 = StudentEnrollment(student=student, enrolled_class=setup_data['class_hifz'])
        e2.full_clean() # Should pass
        e2.save()
        
        assert StudentEnrollment.objects.filter(student=student, is_active=True).count() == 2

    def test_prevent_duplicate_program_enrollment(self, setup_data):
        student = Student.objects.create(name="Dupe", father_name="Tester", mobile_number="+92-300-2222222")
        
        # 1. Enroll in Nazra
        StudentEnrollment.objects.create(student=student, enrolled_class=setup_data['class_nazra'])
        
        # 2. Try enroll in Nazra AGAIN (Same Program) without deactivating first
        class_nazra_B = Class.objects.create(
            name="N2", 
            campus=setup_data['campus'], 
            program=setup_data['prog_nazra'], # Same program
            shift="Evening"
        )
        
        with pytest.raises(ValidationError):
            e_dupe = StudentEnrollment(student=student, enrolled_class=class_nazra_B)
            e_dupe.full_clean()

    def test_soft_delete_student(self):
        student = Student.objects.create(name="Going", father_name="Gone", mobile_number="+92-300-3333333")
        student.soft_delete()
        assert student.status == "Left"
