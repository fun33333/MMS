from rest_framework import serializers
from administration.models import Campus, Program, Class

class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = ['id', 'name', 'location', 'capacity', 'is_active', 'created_at']

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'description', 'is_active', 'created_at']

class ClassSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = Class
        fields = [
            'id', 'name', 'campus', 'campus_name', 
            'program', 'program_name', 'shift', 
            'capacity', 'is_active', 'created_at'
        ]
