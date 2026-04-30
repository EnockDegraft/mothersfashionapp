# Users Data Backup

This directory contains JSON backups of user data from the User Management system.

## Files

- `users.json` - Latest backup of all users (updated each time you export)
- `users-backup-YYYY-MM-DD.json` - Timestamped backups for version history

## Format

Each JSON file contains:
```json
{
  "exportedAt": "2024-01-15T10:30:45.123Z",
  "totalUsers": 5,
  "users": [
    {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "password": "hashedpassword",
      "createdAt": "2024-01-10T08:15:00.000Z"
    }
  ]
}
```

## How to Generate Backups

1. Go to User Management page (`/admin/users`)
2. Click "Save to Project" to save users to this directory
3. Click "Download" to download a file directly to your computer

## Important Notes

⚠️ **Security**: User passwords are stored in plain text in these backups. Keep these files secure and never commit them to version control with sensitive data.

💡 **Backup Strategy**: Regular exports serve as backups in case the localStorage is cleared or lost.
