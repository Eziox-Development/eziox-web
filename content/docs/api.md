---
title: API Access
description: Integrate Eziox with your applications using our REST API.
category: Features
icon: Key
order: 4
---

# API Access

Build integrations and automate your workflow with the Eziox API.

## Overview

The Eziox API allows you to:

- Read your profile data
- Manage your links programmatically
- Access analytics data
- Apply templates

## Authentication

All API requests require an API key. Generate one at [Dashboard → API Access](/profile?tab=api).

### API Key Format

```
ezx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Using Your Key

Include your API key in the `Authorization` header:

```bash
curl -X GET "https://api.eziox.link/v1/profile" \
  -H "Authorization: Bearer ezx_your_api_key_here"
```

## Rate Limits

Rate limits vary by subscription tier:

| Tier | Requests/Hour |
|------|---------------|
| Free | 1,000 |
| Pro | 5,000 |
| Creator | 10,000 |
| Lifetime | 10,000 |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706140800
```

## Endpoints

### Profile

#### Get Profile

```http
GET /v1/profile
```

Returns your profile information.

**Response:**

```json
{
  "id": "usr_123",
  "username": "johndoe",
  "name": "John Doe",
  "bio": "Developer & Creator",
  "avatar": "https://...",
  "banner": "https://...",
  "theme": "eziox-default",
  "stats": {
    "views": 1234,
    "followers": 56,
    "following": 12
  }
}
```

### Links

#### List Links

```http
GET /v1/links
```

Returns all your links.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max results (default: 50) |
| `offset` | number | Pagination offset |
| `active` | boolean | Filter by active status |

**Response:**

```json
{
  "links": [
    {
      "id": "lnk_123",
      "title": "My Website",
      "url": "https://example.com",
      "clicks": 42,
      "isActive": true,
      "order": 0
    }
  ],
  "total": 1
}
```

#### Create Link

```http
POST /v1/links
```

**Request Body:**

```json
{
  "title": "New Link",
  "url": "https://example.com",
  "description": "Optional description",
  "thumbnail": "https://...",
  "isActive": true
}
```

#### Update Link

```http
PATCH /v1/links/:id
```

#### Delete Link

```http
DELETE /v1/links/:id
```

### Analytics

#### Get Analytics

```http
GET /v1/analytics
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `7d`, `30d`, `90d`, `1y` |
| `metric` | string | `views`, `clicks`, `all` |

**Response:**

```json
{
  "period": "30d",
  "summary": {
    "views": 1234,
    "clicks": 567,
    "clickRate": 0.46
  },
  "daily": [
    { "date": "2026-01-01", "views": 42, "clicks": 18 }
  ]
}
```

## Permissions

When creating an API key, you can configure granular permissions:

| Permission | Access |
|------------|--------|
| `profile:read` | Read profile data |
| `profile:write` | Update profile |
| `links:read` | List links |
| `links:write` | Create/update links |
| `links:delete` | Delete links |
| `analytics:read` | Access analytics |
| `templates:read` | List templates |
| `templates:apply` | Apply templates |

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 3600
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## SDKs & Libraries

Coming soon:

- JavaScript/TypeScript SDK
- Python SDK
- Go SDK

## Webhooks

Webhook support is planned for a future release. Currently, only Stripe webhooks are supported for payment events.

---

Questions? Check out our [API Documentation](/api-docs) for interactive examples.
