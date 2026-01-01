#!/usr/bin/env bash
# Exit on error
set -o errexit

# Note: Buildpack already installs requirements and collects static files.
# We do not need to run pip install or collectstatic here.

# Apply database migrations
# Using 'python' explicitly. 
# If 'python' fails, we might need full path, but it should be available since buildpack uses it.
python manage.py migrate
