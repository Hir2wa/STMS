# Transport Management System - API Endpoints Documentation

## Base URL
```
http://localhost:8080/api
```

---

## Location Endpoints (`/api/locations`)

### 1. Save Province
**POST** `/api/locations/save`

**Request Body:**
```json
{
  "name": "Kigali",
  "code": "PROV001",
  "type": "PROVINCE"
}
```

**Response:** `201 Created`
```json
"Province saved successfully"
```

---

### 2. Save Child Location (District, Sector, Cell, or Village)
**POST** `/api/locations/saveChild?parentCode=PROV001`

**Request Body:**
```json
{
  "name": "Nyarugenge",
  "code": "DIST001",
  "type": "DISTRICT"
}
```

**Response:** `201 Created`
```json
"Child saved successfully"
```

---

### 3. Get Location by Code
**GET** `/api/locations/getLocation?code=PROV001`

**Response:** `200 OK`
```json
{
  "locationId": "uuid-here",
  "name": "Kigali",
  "code": "PROV001",
  "type": "PROVINCE",
  "parent": null
}
```

---

### 4. Get Province Name by Sector Code
**GET** `/api/locations/getProvinceNameBySector?code=SECT001`

**Response:** `200 OK`
```json
"Kigali"
```

---

### 5. Get All Locations (Paginated)
**GET** `/api/locations/all?page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Kigali",
      "code": "PROV001",
      "type": "PROVINCE"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 50,
  "totalPages": 5
}
```

---

### 6. Get Locations by Type (Paginated)
**GET** `/api/locations/type/PROVINCE?page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Kigali",
      "code": "PROV001",
      "type": "PROVINCE"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### 7. Get Root Locations (Provinces - Paginated)
**GET** `/api/locations/roots?page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Kigali",
      "code": "PROV001",
      "type": "PROVINCE"
    }
  ],
  "totalElements": 5
}
```

---

### 8. Get Children of a Location (Paginated)
**GET** `/api/locations/PROV001/children?page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Nyarugenge",
      "code": "DIST001",
      "type": "DISTRICT",
      "parent": {
        "code": "PROV001",
        "name": "Kigali"
      }
    }
  ],
  "totalElements": 10
}
```

---

### 9. Update Location
**PUT** `/api/locations/PROV001`

**Request Body:**
```json
{
  "name": "Kigali City",
  "code": "PROV001",
  "type": "PROVINCE"
}
```

**Response:** `200 OK`
```json
"Location updated successfully"
```

---

### 10. Delete Location
**DELETE** `/api/locations/PROV001`

**Response:** `200 OK`
```json
"Location deleted successfully"
```

---

### 11. Search Locations by Name (Paginated)
**GET** `/api/locations/search?name=Kigali&page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Kigali",
      "code": "PROV001",
      "type": "PROVINCE"
    }
  ],
  "totalElements": 1
}
```

---

### 12. Check if Location Exists
**GET** `/api/locations/exists/PROV001`

**Response:** `200 OK`
```json
true
```

---

### 13. Get Provinces with Users (NEW)
**GET** `/api/locations/provinces/with-users?paginated=false`

**Response:** `200 OK`
```json
[
  {
    "locationId": "uuid-here",
    "name": "Kigali",
    "code": "PROV001",
    "type": "PROVINCE"
  },
  {
    "locationId": "uuid-here",
    "name": "Northern Province",
    "code": "PROV002",
    "type": "PROVINCE"
  }
]
```

**GET** `/api/locations/provinces/with-users?paginated=true&page=0&size=10&sortBy=name&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "locationId": "uuid-here",
      "name": "Kigali",
      "code": "PROV001",
      "type": "PROVINCE"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

---

## User Endpoints (`/api/users`)

### 1. Save User
**POST** `/api/users/save`

**Request Body:**
```json
{
  "fullNames": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+250788123456",
  "password": "password123",
  "gender": "MALE",
  "role": "PARENT"
}
```

**Response:** `201 Created`
```json
"User saved successfully"
```

---

### 2. Save User with Location
**POST** `/api/users/saveWithLocation?locationCode=VILL001`

**Request Body:**
```json
{
  "fullNames": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+250788654321",
  "password": "password123",
  "gender": "FEMALE",
  "role": "DRIVER"
}
```

**Response:** `201 Created`
```json
"User saved successfully"
```

---

### 3. Assign Location to User
**PUT** `/api/users/assignLocation?userId=user-uuid-here&locationCode=VILL001`

**Response:** `200 OK`
```json
"Location assigned successfully"
```

---

### 4. Get User by ID
**GET** `/api/users/{userId}`

**Example:** `/api/users/550e8400-e29b-41d4-a716-446655440000`

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "fullNames": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+250788123456",
  "gender": "MALE",
  "role": "PARENT",
  "location": {
    "locationId": "uuid-here",
    "name": "Kimisagara",
    "code": "VILL001",
    "type": "VILLAGE"
  }
}
```

---

### 5. Get User by Email
**GET** `/api/users/email/john.doe@example.com`

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "fullNames": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+250788123456",
  "gender": "MALE",
  "role": "PARENT",
  "location": {
    "locationId": "uuid-here",
    "name": "Kimisagara",
    "code": "VILL001",
    "type": "VILLAGE"
  }
}
```

---

### 6. Get All Users
**GET** `/api/users/all`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+250788123456",
    "gender": "MALE",
    "role": "PARENT"
  }
]
```

---

### 7. Get All Users (Paginated) - NEW
**GET** `/api/users/allPaginated?page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+250788123456",
      "gender": "MALE",
      "role": "PARENT"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 50,
  "totalPages": 5
}
```

---

### 8. Get Users by Role
**GET** `/api/users/role/PARENT`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "role": "PARENT"
  }
]
```

---

### 9. Get Users by Role (Paginated) - NEW
**GET** `/api/users/role/PARENT/paginated?page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com",
      "role": "PARENT"
    }
  ],
  "totalElements": 25,
  "totalPages": 3
}
```

---

### 10. Get Users by Gender
**GET** `/api/users/gender/MALE`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "gender": "MALE"
  }
]
```

---

### 11. Get Users by Gender (Paginated) - NEW
**GET** `/api/users/gender/MALE/paginated?page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com",
      "gender": "MALE"
    }
  ],
  "totalElements": 30,
  "totalPages": 3
}
```

---

### 12. Get Users by Location Code
**GET** `/api/users/location/VILL001`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "location": {
      "code": "VILL001",
      "name": "Kimisagara"
    }
  }
]
```

---

### 13. Search Users by Name
**GET** `/api/users/search?name=John`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com"
  }
]
```

---

### 14. Search Users by Name (Paginated) - NEW
**GET** `/api/users/search/paginated?name=John&page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### 15. Update User
**PUT** `/api/users/update?id=550e8400-e29b-41d4-a716-446655440000`

**Request Body:**
```json
{
  "fullNames": "John Updated Doe",
  "phoneNumber": "+250788999999"
}
```

**Response:** `200 OK`
```json
"User updated successfully"
```

---

### 16. Delete User
**DELETE** `/api/users/delete?id=550e8400-e29b-41d4-a716-446655440000`

**Response:** `200 OK`
```json
"User deleted successfully"
```

---

### 17. Check if User Exists by Email
**GET** `/api/users/exists/john.doe@example.com`

**Response:** `200 OK`
```json
true
```

---

### 18. Get Users by Province Code (NEW)
**GET** `/api/users/province/code/PROV001?paginated=false`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "location": {
      "code": "VILL001",
      "name": "Kimisagara",
      "type": "VILLAGE"
    }
  },
  {
    "userId": "uuid-here-2",
    "fullNames": "Jane Smith",
    "email": "jane.smith@example.com",
    "location": {
      "code": "DIST001",
      "name": "Nyarugenge",
      "type": "DISTRICT"
    }
  }
]
```

**GET** `/api/users/province/code/PROV001?paginated=true&page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com",
      "location": {
        "code": "VILL001",
        "name": "Kimisagara"
      }
    }
  ],
  "totalElements": 50,
  "totalPages": 5
}
```

---

### 19. Get Users by Province Name (NEW)
**GET** `/api/users/province/name/Kigali?paginated=false`

**Response:** `200 OK`
```json
[
  {
    "userId": "uuid-here",
    "fullNames": "John Doe",
    "email": "john.doe@example.com",
    "location": {
      "code": "VILL001",
      "name": "Kimisagara",
      "type": "VILLAGE"
    }
  }
]
```

**GET** `/api/users/province/name/Kigali?paginated=true&page=0&size=10&sortBy=fullNames&sortDir=asc`

**Response:** `200 OK`
```json
{
  "content": [
    {
      "userId": "uuid-here",
      "fullNames": "John Doe",
      "email": "john.doe@example.com",
      "location": {
        "code": "VILL001",
        "name": "Kimisagara"
      }
    }
  ],
  "totalElements": 25,
  "totalPages": 3
}
```

---

### 20. Get Province from User by User ID (NEW)
**GET** `/api/users/550e8400-e29b-41d4-a716-446655440000/province`

**Response:** `200 OK`
```json
{
  "locationId": "uuid-here",
  "name": "Kigali",
  "code": "PROV001",
  "type": "PROVINCE"
}
```

**Response (if user not found):** `404 Not Found`
```json
"User not found or user has no location assigned"
```

---

### 21. Get Province from User by Email (NEW)
**GET** `/api/users/email/john.doe@example.com/province`

**Response:** `200 OK`
```json
{
  "locationId": "uuid-here",
  "name": "Kigali",
  "code": "PROV001",
  "type": "PROVINCE"
}
```

**Response (if user not found):** `404 Not Found`
```json
"User not found or user has no location assigned"
```

---

### 22. Check if Users Exist for Province Code (NEW)
**GET** `/api/users/province/code/PROV001/exists`

**Response:** `200 OK`
```json
true
```

---

### 23. Check if Users Exist for Province Name (NEW)
**GET** `/api/users/province/name/Kigali/exists`

**Response:** `200 OK`
```json
true
```

---

## Common Query Parameters

### Pagination Parameters
- `page` - Page number (0-indexed, default: 0)
- `size` - Number of items per page (default: 10)
- `sortBy` - Field to sort by (default: varies by endpoint)
- `sortDir` - Sort direction: `asc` or `desc` (default: `asc`)
- `paginated` - Boolean to enable/disable pagination (default: `false`)

### Example Pagination URLs:
```
GET /api/users/allPaginated?page=0&size=20&sortBy=fullNames&sortDir=desc
GET /api/locations/all?page=2&size=5&sortBy=name&sortDir=asc
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Enums Reference

### Elocation Type
- `PROVINCE`
- `DISTRICT`
- `SECTOR`
- `CELL`
- `VILLAGE`

### Gender
- `MALE`
- `FEMALE`
- `OTHER`

### Role
- `PARENT`
- `DRIVER`
- `ADMIN`
- (and other roles as defined in your system)

---

## Notes

1. **Province Queries**: The province-based queries (by code or name) automatically traverse the location hierarchy. This means if a user is located at Village, Cell, Sector, or District level, they will still be found when querying by their parent Province.

2. **Hierarchy Structure**: The Rwandan administrative structure is:
   - Province (top level, no parent)
   - District (parent: Province)
   - Sector (parent: District)
   - Cell (parent: Sector)
   - Village (parent: Cell)

3. **Pagination**: Most endpoints support both paginated and non-paginated responses. Use the `paginated=true` parameter to get paginated results.

4. **Sorting**: All paginated endpoints support sorting. Use `sortBy` to specify the field and `sortDir` to specify direction (asc/desc).

