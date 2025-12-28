from django.contrib import admin
from .models import Campus, Program, Class

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'location')
    ordering = ('-created_at',)

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'campus', 'program', 'shift', 'capacity', 'is_active')
    list_filter = ('campus', 'program', 'shift', 'is_active')
    search_fields = ('name', 'campus__name', 'program__name')
    ordering = ('campus', 'program', 'name')
