# Instructor Profile DB Notes

This document explains how instructor profile data is stored for the admin dashboard profile section.

## Scope

- Stores instructor/admin profile metadata only.
- Does not store profile image files.

## Migration

Run on lms_core_db:

```bash
mysql -u root -p < sql/003_create_instructor_profiles.sql
```

## Table

Table: instructor_profiles

Columns:

- id: INT, primary key
- user_id: INT, unique per authenticated user
- display_name: VARCHAR(150), required
- primary_email: VARCHAR(255), required
- designation: VARCHAR(150), required
- alternative_email: VARCHAR(255), required
- bio: VARCHAR(500), optional
- profile_description: TEXT, optional
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Indexes:

- uq_instructor_profiles_user_id
- idx_instructor_profiles_primary_email
- idx_instructor_profiles_alternative_email

## API Contract Used By Frontend

### GET /auth/instructor-profile

Returns:

```json
{
  "profile": {
    "userId": 12,
    "displayName": "Jane Doe",
    "email": "jane@example.com",
    "designation": "Instructor",
    "alternativeEmail": "jane.alt@example.com",
    "bio": "A short bio",
    "description": "Longer profile description",
    "updatedAt": "2026-05-01T10:20:30.000Z"
  }
}
```

### PUT /auth/instructor-profile

Input:

```json
{
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "designation": "Instructor",
  "alternativeEmail": "jane.alt@example.com",
  "bio": "A short bio",
  "description": "Longer profile description"
}
```

Behavior:

- Upserts by user_id.
- Validates required fields and email formats.
- Enforces max lengths:
  - bio <= 500
  - description <= 5000
