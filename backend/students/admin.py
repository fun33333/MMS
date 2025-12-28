from django.contrib import admin
from .models import Student, StudentEnrollment

class StudentEnrollmentInline(admin.TabularInline):
    """Inline view of enrollments on Student page"""
    model = StudentEnrollment
    extra = 0
    readonly_fields = ('start_date', 'end_date', 'is_active')
    can_delete = False  # No hard deletes allowed

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'father_name', 'mobile_number', 'status', 'admission_date')
    list_filter = ('status', 'admission_date')
    search_fields = ('name', 'father_name', 'mobile_number', 'cnic')
    ordering = ('-admission_date',)
    readonly_fields = ('admission_date', 'created_at', 'updated_at')  # admission_date is auto_now_add
    inlines = [StudentEnrollmentInline]
    
    fieldsets = (
        ('ذاتی معلومات', {
            'fields': ('name', 'father_name', 'mobile_number', 'cnic', 'address')
        }),
        ('داخلہ', {
            'fields': ('admission_date', 'status', 'remarks')  # admission_date is read-only
        }),
        ('سسٹم', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'enrolled_class', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'enrolled_class__campus', 'enrolled_class__program')
    search_fields = ('student__name', 'enrolled_class__name')
    ordering = ('-start_date',)
    readonly_fields = ('start_date', 'end_date')
