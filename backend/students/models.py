from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel
from administration.models import Class

class Student(TimeStampedModel):
    STATUS_CHOICES = [
        ('Active', _('Active')),
        ('Left', _('Left')),
    ]

    # Validators - Relaxed for development
    phone_validator = RegexValidator(
        regex=r'^[\+]?[\d\-\s]{10,15}$',
        message=_("Phone number must be 10-15 digits. Example: +92-300-1234567 or 03001234567")
    )
    cnic_validator = RegexValidator(
        regex=r'^\d{5}-\d{7}-\d{1}$',
        message=_("CNIC must be in the format: 'XXXXX-XXXXXXX-X'.")
    )

    name = models.CharField(max_length=255, verbose_name=_("Student Name"))
    father_name = models.CharField(max_length=255, verbose_name=_("Father/Guardian Name"))
    cnic = models.CharField(
        max_length=15, 
        validators=[cnic_validator], 
        blank=True, 
        null=True, 
        verbose_name=_("CNIC / B-Form")
    )
    mobile_number = models.CharField(
        max_length=15, 
        validators=[phone_validator], 
        verbose_name=_("Mobile Number")
    )
    address = models.TextField(verbose_name=_("Address"), blank=True)
    admission_date = models.DateField(auto_now_add=True, verbose_name=_("Date of Admission"))
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='Active', 
        verbose_name=_("Status")
    )
    remarks = models.TextField(blank=True, verbose_name=_("Remarks"))

    class Meta:
        verbose_name = _("Student")
        verbose_name_plural = _("Students")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} s/o {self.father_name}"

    def soft_delete(self):
        """Standard deactivation instead of deletion"""
        self.status = 'Left'
        self.save()


class StudentEnrollment(TimeStampedModel):
    ENROLLMENT_STATUS = [
        ('Active', _('Active')),
        ('Completed', _('Completed')),
        ('Transferred', _('Transferred')),
        ('Left', _('Left')),
        ('Expelled', _('Expelled')),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_class = models.ForeignKey(Class, on_delete=models.RESTRICT, related_name='enrollments')
    start_date = models.DateField(auto_now_add=True, verbose_name=_("Start Date"))
    end_date = models.DateField(null=True, blank=True, verbose_name=_("End Date"))
    
    # New Fields
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='Active', verbose_name=_("Status"))
    progress = models.CharField(max_length=255, blank=True, verbose_name=_("Progress/Subject"))
    
    is_active = models.BooleanField(default=True, verbose_name=_("Active Enrollment"))

    class Meta:
        verbose_name = _("Student Enrollment")
        verbose_name_plural = _("Student Enrollments")
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.student.name} -> {self.enrolled_class.name} ({self.status})"

    # Removed clean method restriction to allow multiple enrollments as per user request
    # def clean(self): ...
