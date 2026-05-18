# API Documentation

Base URL: `http://localhost:4000` (development)

## Health

### `GET /health`

Returns API status.

**Response `200`**

```json
{ "status": "ok", "timestamp": "2025-05-16T12:00:00.000Z" }
```

---

## Forms

### `GET /api/forms`

List latest version of each form template family.

**Response `200`**: `FormTemplate[]`

### `GET /api/forms/:id`

Get a specific form template version with fields.

**Response `200`**: `FormTemplate`  
**Response `404`**: Form not found

### `POST /api/forms`

Create a new form template (version 1).

**Body**

```json
{
  "name": "Contact Us",
  "description": "Optional",
  "fields": [
    {
      "label": "Email",
      "type": "email",
      "required": true,
      "placeholder": "you@example.com",
      "helpText": "Optional help",
      "options": ["A", "B"],
      "order": 0
    }
  ]
}
```

**Response `201`**: `FormTemplate`

### `PUT /api/forms/:id`

Update a form template. If any submission exists in the template family, a **new version** is created instead of mutating the existing row.

**Body**: Same as `POST /api/forms`

**Response `200`**: `FormTemplate` (updated in place or new version)

### `DELETE /api/forms/:id`

Delete all versions in the template family.

**Response `200`**: `{ "deleted": number }`

---

## Submissions

### `GET /api/forms/:id/submissions`

List submissions for the specified template **version**.

### `POST /api/forms/:id/submissions`

Create a submission. Always attaches to the **latest version** in the template family.

**Body**

```json
{
  "values": [
    { "fieldId": "uuid", "value": "answer" }
  ]
}
```

**Response `201`**: `FormSubmission`

### `GET /api/submissions/:id`

Get a single submission with values and field metadata.

**Response `200`**: `FormSubmission`  
**Response `404`**: Not found

---

## Error format

```json
{
  "error": "Validation failed",
  "details": {}
}
```
