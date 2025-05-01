# Appwrite Database Schema and Auth Settings

This document outlines the database schema and authentication settings for implementing the resume management system in Appwrite.

## Authentication Settings

### Basic Setup

1. Navigate to the **Auth** section in Appwrite Console
2. Configure the following settings:

   **Session Management:**
    - Session Duration: 14 days (recommended)
    - Session Limit: Set based on your needs

   **Authentication Methods:**
    - Enable Email/Password authentication
    - Set minimum password length: 8 characters
    - Enable password requirements (special chars, numbers, etc.)

### Optional Auth Enhancements

Consider enabling:
- Email verification
- Personal data validation
- Account recovery via email

### User Permissions

Since the resume page is publicly accessible without login (only the dashboard requires authentication), you don't need to create special teams for public access. Instead, use document-level permissions to control access:

- The document owner (authenticated user) gets full CRUD access to their resume content
- Public visitors get read-only access to content marked as visible

## Database Schema

### Database Configuration

Create a new database named "resume" with the following collections:

### 1. Profile Collection

**Collection ID**: `profile`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID (owner of the resume)        |
| fullName     | string       | Yes      | Full name of the person              |
| jobTitle     | string       | Yes      | Professional title                   |
| summary      | string       | No       | Professional summary                 |
| email        | string       | No       | Contact email                        |
| phone        | string       | No       | Contact phone number                 |
| location     | string       | No       | Location/address                     |
| website      | string       | No       | Personal website URL                 |
| avatarId     | string       | No       | ID of profile image in storage       |
| isVisible    | boolean      | Yes      | Control visibility of profile        |
| socialLinks  | string[]     | No       | Array of social media URLs           |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId (unique)

**Permissions:**
- Read: Anyone (no authentication required) where isVisible=true
- Write/Update/Delete: Document owner only (authenticated user)

### 2. Sections Collection

**Collection ID**: `sections`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID (owner of the section)       |
| title        | string       | Yes      | Section title (e.g., "Experience")   |
| slug         | string       | Yes      | URL-friendly identifier              |
| description  | string       | No       | Optional section description         |
| order        | integer      | Yes      | Display order                        |
| isVisible    | boolean      | Yes      | Control visibility on public page    |
| iconName     | string       | No       | Lucide icon name for the section     |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId + slug (unique)
- userId + order (not unique)

**Permissions:**
- Read: Anyone where isVisible=true
- Write/Update/Delete: Document owner only

### 3. Entries Collection

**Collection ID**: `entries`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID (owner of the entry)         |
| sectionId    | string       | Yes      | ID of parent section                 |
| title        | string       | Yes      | Entry title (e.g., job title)        |
| subtitle     | string       | No       | Entry subtitle (e.g., company name)  |
| location     | string       | No       | Location (e.g., city, remote)        |
| startDate    | string       | Yes      | Start date (YYYY-MM format)          |
| endDate      | string       | No       | End date or "Present"                |
| current      | boolean      | Yes      | Whether this is current              |
| description  | string       | No       | Rich text description                |
| bullets      | string[]     | No       | Array of bullet points               |
| order        | integer      | Yes      | Display order within section         |
| isVisible    | boolean      | Yes      | Control visibility on public page    |
| url          | string       | No       | Related URL (e.g., company website)  |
| imageId      | string       | No       | ID of entry image in storage         |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId + sectionId (not unique)
- userId + sectionId + order (not unique)

**Permissions:**
- Read: Anyone where isVisible=true
- Write/Update/Delete: Document owner only

### 4. Skills Collection

**Collection ID**: `skills`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID (owner of the skill)         |
| name         | string       | Yes      | Skill name                           |
| category     | string       | Yes      | Skill category                       |
| proficiency  | integer      | Yes      | Proficiency level (1-5)              |
| yearsExp     | number       | No       | Years of experience                  |
| isVisible    | boolean      | Yes      | Control visibility on public page    |
| order        | integer      | Yes      | Display order                        |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId + name (unique)
- userId + category (not unique)

**Permissions:**
- Read: Anyone where isVisible=true
- Write/Update/Delete: Document owner only

### 5. Projects Collection (Optional)

**Collection ID**: `projects`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID (owner of the project)       |
| title        | string       | Yes      | Project title                        |
| description  | string       | Yes      | Project description                  |
| technologies | string[]     | No       | Technologies used                    |
| imageId      | string       | No       | ID of project image                  |
| url          | string       | No       | Project URL                          |
| repoUrl      | string       | No       | Source code repository URL           |
| startDate    | string       | Yes      | Start date                           |
| endDate      | string       | No       | End date                             |
| isVisible    | boolean      | Yes      | Control visibility on public page    |
| order        | integer      | Yes      | Display order                        |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId + title (unique)
- userId + order (not unique)

**Permissions:**
- Read: Anyone where isVisible=true
- Write/Update/Delete: Document owner only

### 6. Settings Collection (Optional)

**Collection ID**: `settings`

| Attribute    | Type         | Required | Description                          |
|--------------|--------------|----------|--------------------------------------|
| userId       | string       | Yes      | User ID                              |
| theme        | string       | No       | Selected theme                       |
| fontPrimary  | string       | No       | Primary font                         |
| fontSecondary| string       | No       | Secondary font                       |
| accentColor  | string       | No       | Accent color                         |
| layout       | string       | No       | Layout preference                    |
| customCss    | string       | No       | Custom CSS                           |
| updatedAt    | datetime     | Yes      | Last updated timestamp               |

**Indexes:**
- userId (unique)

**Permissions:**
- Read/Write/Update/Delete: Document owner only

## Storage Setup

### Bucket Configuration

Create a bucket named "resume_assets" with the following settings:

**Settings:**
- Maximum File Size: 5MB (recommended)
- Allowed File Extensions: jpg, jpeg, png, pdf, svg

**Permissions:**
- Read: Anyone for files marked as public
- Write/Update/Delete: Document owner only

## Security and Access Rules

### Collection Permissions

Configure permission rules at the collection level:

1. **Read Permissions**:
    - For public access (resume page): Allow anyone to read documents where `isVisible = true`
    - This enables the public resume page to display content without requiring authentication

2. **Write/Update/Delete Permissions**:
    - Restrict to document owners only (authenticated users)
    - This ensures only the owner can modify their resume content via the dashboard

### Function Rules

For additional security, implement these rules:

1. **User Isolation**: Users can only access their own data
   ```
   // Example rule
   document.userId === request.auth.userId
   ```

2. **Public Visibility**: Public access only to entries marked as visible
   ```
   // Example rule
   document.isVisible === true
   ```

### API Keys

For SvelteKit Integration:
- Create a dedicated API key with limited scope
- Only enable necessary permissions
- Set appropriate domain restrictions

## Additional Notes

1. **Timestamps**: Always update the `updatedAt` field when modifying documents
2. **Unique Constraints**: Ensure unique indexes are properly set to prevent duplicates
3. **User Association**: Always associate all collections with the user ID
4. **Visibility Control**: The `isVisible` field enables content to be created and edited before making it public