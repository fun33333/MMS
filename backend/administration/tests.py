import pytest
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from administration.models import Campus, Program, Class

@pytest.mark.django_db
class TestAdministrationModels:
    
    def test_campus_creation(self):
        campus = Campus.objects.create(name="Main Campus", location="City Center", capacity=500)
        assert campus.name == "Main Campus"
        assert campus.is_active is True

    def test_program_creation(self):
        program = Program.objects.create(name="Hifz", description="Memorization")
        assert program.name == "Hifz"

    def test_class_creation_and_constraints(self):
        campus = Campus.objects.create(name="North Campus")
        program = Program.objects.create(name="Nazra")
        
        # Create Class A
        class_a = Class.objects.create(
            name="Class A",
            campus=campus,
            program=program,
            shift="Morning"
        )
        assert str(class_a) == "Class A - Nazra (Morning)"

        # Constraint Test: Duplicate Class
        with pytest.raises(IntegrityError):
            Class.objects.create(
                name="Class A",
                campus=campus,
                program=program,
                shift="Morning"
            )

    def test_soft_delete_campus(self):
        campus = Campus.objects.create(name="Old Campus")
        campus.delete()
        campus.refresh_from_db()
        assert campus.is_active is False
        assert Campus.objects.filter(name="Old Campus").exists()  # Record still exists
