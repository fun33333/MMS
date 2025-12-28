from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel

class Campus(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True, verbose_name=_("Campus Name"))
    location = models.TextField(blank=True, verbose_name=_("Location"))
    capacity = models.PositiveIntegerField(default=100, verbose_name=_("Capacity"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active Status"))

    class Meta:
        verbose_name = _("Campus")
        verbose_name_plural = _("Campuses")
        ordering = ['name']

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        # Soft delete logic - User requested no hard deletes
        self.is_active = False
        self.save()

class Program(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True, verbose_name=_("Program Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active Status"))

    class Meta:
        verbose_name = _("Program")
        verbose_name_plural = _("Programs")
        ordering = ['name']

    def __str__(self):
        return self.name

class Class(TimeStampedModel):
    SHIFT_CHOICES = [
        ('Morning', _('Morning')),
        ('Afternoon', _('Afternoon')),
        ('Night', _('Night')),
    ]
    
    name = models.CharField(max_length=255, verbose_name=_("Class Name"))
    campus = models.ForeignKey(Campus, on_delete=models.RESTRICT, related_name='classes')
    program = models.ForeignKey(Program, on_delete=models.RESTRICT, related_name='classes')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, verbose_name=_("Shift"))
    capacity = models.PositiveIntegerField(default=30, verbose_name=_("Class Capacity"))
    is_active = models.BooleanField(default=True, verbose_name=_("Active Status"))

    class Meta:
        verbose_name = _("Class")
        verbose_name_plural = _("Classes")
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'campus', 'program', 'shift'], 
                name='unique_class_offering'
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.program.name} ({self.shift})"

    def clean(self):
        # Validation: Check if campus has capacity (Optional strictly, but good for business logic)
        # Note: Simple check here, more complex logic might go in service layer
        pass
