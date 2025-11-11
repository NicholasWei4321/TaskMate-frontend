# API Specifications


## AIPrioritizedTask

### POST /api/AIPrioritizedTask/createTask

**Description:** Creates a new task with the specified details, triggering an initial AI-enhanced priority calculation.

**Requirements:**
- `name` is non-empty and unique for the `owner`.
- `dueDate` is valid.

**Effects:**
- A new task is created with the provided owner, name, description, and due date.
- The task is initially marked as incomplete and not overdue.
- All AI-inferred attributes start as null.
- The priority score is set to an initial time-based value (higher for tasks with closer due dates).
- The system automatically triggers an AI-enhanced priority calculation for the new task and returns it.

**Request Body:**
```json
{
  "owner": "string",
  "name": "string",
  "description": "string",
  "dueDate": "string"
}
```

**Success Response Body (Action):**
```json
{
  "task": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/updateTask

**Description:** Updates existing properties of a task and recalculates its priority.

**Requirements:**
- `task` exists.
- If `newName` is provided, it is non-empty and unique for `task.owner` (excluding the current `task`).
- If `newDueDate` is provided, it is valid.

**Effects:**
- The task's properties are updated with any provided new values.
- If the name is provided, the task's name is changed.
- If the description is provided, it is updated.
- If a new due date is provided, the task's due date is changed and the overdue flag is reset.
- After any updates, the system recalculates the task's priority and returns the updated task.

**Request Body:**
```json
{
  "task": "string",
  "newName": "string | null",
  "newDescription": "string | null",
  "newDueDate": "string | null"
}
```

**Success Response Body (Action):**
```json
{
  "task": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/snoozeTask

**Description:** Updates a task's due date to a future time, resetting its overdue status and recalculating priority.

**Requirements:**
- `task` exists.
- `newDueDate` is in the future relative to the current time.

**Effects:**
- The task's due date is updated to the new date.
- The overdue flag is reset to false.
- The system recalculates the task's priority to reflect the new deadline and returns the updated task.

**Request Body:**
```json
{
  "task": "string",
  "newDueDate": "string"
}
```

**Success Response Body (Action):**
```json
{
  "task": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/completeTask

**Description:** Marks a task as completed, sets its priority to zero, and clears AI-inferred attributes.

**Requirements:**
- `task` exists.

**Effects:**
- The task is marked as completed.
- Its priority score is set to zero.
- All AI-inferred attributes (effort hours, importance, and difficulty) are cleared.
- The updated task is returned.

**Request Body:**
```json
{
  "task": "string"
}
```

**Success Response Body (Action):**
```json
{
  "task": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/markOverdue

**Description:** Marks a task as overdue and recalculates its priority to reflect increased urgency. This is typically a system-triggered action.

**Requirements:**
- `task` exists.
- `task.completed` is false.
- `current time > task.dueDate`.
- `task.overdue` is false.

**Effects:**
- The task is marked as overdue.
- The system automatically recalculates its priority to reflect the increased urgency.

**Request Body:**
```json
{
  "task": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/calculateTaskPriority

**Description:** Triggers an AI-enhanced priority calculation for a given task. This is typically a system-triggered action.

**Requirements:**
- `task` exists.
- `task.completed` is false.

**Effects:**
- The system attempts to use an LLM to infer the task's effort (in hours), importance (1-10), and difficulty (1-10) from its name and description.
- These attributes are validated against their specified ranges.
- If the LLM inference succeeds and validation passes, the task's inferred attributes are updated and the priority score is calculated by combining time urgency with weighted LLM attributes (importance × 50, difficulty × 30, 1/effort × 100 to prioritize quick wins).
- If the LLM inference fails or validation fails, the inferred attributes are cleared and the priority score is calculated based solely on time urgency (due date and overdue status).
- The timestamp of the last priority calculation is recorded.

**Request Body:**
```json
{
  "task": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/getTask

**Description:** Retrieves the full details of a specific task.

**Requirements:**
- `task` exists.

**Effects:**
- Returns the full task object with all fields.

**Request Body:**
```json
{
  "task": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "id": "string",
    "owner": "string",
    "name": "string",
    "description": "string",
    "dueDate": "string",
    "completed": "boolean",
    "overdue": "boolean",
    "inferredEffortHours": "number | null",
    "inferredImportance": "number | null",
    "inferredDifficulty": "number | null",
    "priorityScore": "number",
    "lastPriorityCalculationTime": "string | null"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/getTasksByOwner

**Description:** Retrieves all tasks for a given owner, sorted by priority score in descending order.

**Requirements:**
- `owner` exists.

**Effects:**
- Returns all tasks for the given owner, sorted by priorityScore (descending).

**Request Body:**
```json
{
  "owner": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "id": "string",
    "owner": "string",
    "name": "string",
    "description": "string",
    "dueDate": "string",
    "completed": "boolean",
    "overdue": "boolean",
    "inferredEffortHours": "number | null",
    "inferredImportance": "number | null",
    "inferredDifficulty": "number | null",
    "priorityScore": "number",
    "lastPriorityCalculationTime": "string | null"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/AIPrioritizedTask/getPrioritizedTasks

**Description:** Retrieves all non-completed tasks for a given owner, sorted by priority score in descending order.

**Requirements:**
- `owner` exists.

**Effects:**
- Returns all non-completed tasks for the given owner, sorted by priorityScore (descending).

**Request Body:**
```json
{
  "owner": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "id": "string",
    "owner": "string",
    "name": "string",
    "description": "string",
    "dueDate": "string",
    "completed": "boolean",
    "overdue": "boolean",
    "inferredEffortHours": "number | null",
    "inferredImportance": "number | null",
    "inferredDifficulty": "number | null",
    "priorityScore": "number",
    "lastPriorityCalculationTime": "string | null"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

## ExternalAssignmentSync

### POST /api/ExternalAssignmentSync/connectSource

**Description:** Establishes a new connection to an external platform for a given user using provided credentials and identification.

**Requirements:**
- No `ExternalSourceAccount` already exists for the `owner` with the same `sourceName`.
- The `details` are valid and allow successful authentication with the external platform API.
- (Implicit for error cases) The provided `details` do NOT allow successful authentication with the external platform.
- (Implicit for error cases) A network error occurs while attempting to validate `details`.
- (Implicit for error cases) An `ExternalSourceAccount` already exists for the `owner` with the same `sourceName`.

**Effects:**
- A new unique `ExternalSourceAccount` identifier is generated and returned.
- The new `ExternalSourceAccount` is added to the concept's state, storing its `owner`, `sourceType`, `sourceName`, and `connectionDetails`.
- `lastSuccessfulPoll` for the new `sourceAccount` is initialized to `null`.
- (Implicit for error cases) Returns an `InvalidCredentialsError`.
- (Implicit for error cases) Returns a `NetworkError`.
- (Implicit for error cases) Returns a `DuplicateSourceError`.

**Request Body:**
```json
{
  "owner": "string",
  "sourceType": "string",
  "sourceName": "string",
  "details": {
    "apiToken": "string",
    "baseUrl": "string"
  }
}
```

**Success Response Body (Action):**
```json
{
  "sourceAccount": "string"
}
```

**Error Response Body:**
```json
{
  "error": "InvalidCredentialsError"
}
```
*Or:*
```json
{
  "error": "NetworkError"
}
```
*Or:*
```json
{
  "error": "DuplicateSourceError"
}
```
---

### POST /api/ExternalAssignmentSync/disconnectSource

**Description:** Removes an existing connection to an external platform and all its associated assignment mappings.

**Requirements:**
- `sourceAccount` exists in the concept's state.
- (Implicit for error cases) `sourceAccount` does NOT exist in the concept's state.

**Effects:**
- The `sourceAccount` and its associated data (`owner`, `sourceType`, `sourceName`, `connectionDetails`, `lastSuccessfulPoll`) are removed from the concept's state.
- All mappings from `ExternalAssignmentId` to `Assignment` that are associated with the `sourceAccount` are removed.
- (Implicit for error cases) Returns a `SourceNotFound` error.

**Request Body:**
```json
{
  "sourceAccount": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "SourceNotFound"
}
```
---

### POST /api/ExternalAssignmentSync/pollExternalSource

**Description:** Calls the external API to retrieve the current list of assignments from a connected platform.

**Requirements:**
- `sourceAccount` exists in the concept's state.
- `sourceAccount.connectionDetails` are valid and functional for accessing the external platform.
- (Implicit for error cases) `sourceAccount` exists and a network error occurs during the external API call.
- (Implicit for error cases) `sourceAccount` exists and the external API returns a rate limit error.
- (Implicit for error cases) `sourceAccount` exists and the external API call fails due to invalid credentials or similar connection issues.

**Effects:**
- Connects to the external platform using `sourceAccount.connectionDetails`.
- Retrieves the current list of assignments from the external platform, including their unique identifiers (`externalId`), their full details (`details`), and their latest modification timestamps (`externalModificationTimestamp`).
- `sourceAccount.lastSuccessfulPoll` is updated to the current time.
- Returns the raw list of assignments.
- (Implicit for error cases) Returns a `NetworkError`.
- (Implicit for error cases) Returns an `ApiRateLimitError`.
- (Implicit for error cases) Returns a `SourceConnectionError`.

**Request Body:**
```json
{
  "sourceAccount": "string"
}
```

**Success Response Body (Action):**
```json
{
  "rawExternalAssignments": [
    {
      "externalId": "string",
      "details": {
        "name": "string",
        "description": "string | null",
        "dueDate": "string | null"
      },
      "externalModificationTimestamp": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "NetworkError"
}
```
*Or:*
```json
{
  "error": "ApiRateLimitError"
}
```
*Or:*
```json
{
  "error": "SourceConnectionError"
}
```
---

### POST /api/ExternalAssignmentSync/identifyChanges

**Description:** Compares newly fetched external assignments against previously recorded state to identify new or updated items.

**Requirements:**
- `sourceAccount` exists in the concept's state.

**Effects:**
- For each external assignment in `rawExternalAssignments`:
    - If no ExternalAssignment exists with `source = sourceAccount` and `externalId = externalId`, OR if an ExternalAssignment exists but its `externalModificationTimestamp` is older than the one from `rawExternalAssignments`:
        - The assignment details are added to the `assignmentsToProcess` result.
        - `existingInternalId` is set to the `internalAssignment` from the matching ExternalAssignment if it exists, otherwise `null`.
- Returns the set of assignments identified for processing.

**Request Body:**
```json
{
  "sourceAccount": "string",
  "rawExternalAssignments": [
    {
      "externalId": "string",
      "details": {
        "name": "string",
        "description": "string | null",
        "dueDate": "string | null"
      },
      "externalModificationTimestamp": "string"
    }
  ]
}
```

**Success Response Body (Action):**
```json
{
  "assignmentsToProcess": [
    {
      "externalId": "string",
      "details": {
        "name": "string",
        "description": "string | null",
        "dueDate": "string | null"
      },
      "externalModificationTimestamp": "string",
      "existingInternalId": "string | null"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/ExternalAssignmentSync/recordInternalSync

**Description:** Records that an external assignment has been successfully processed by the application (either created or updated) and mapped to an internal assignment, along with its latest external modification timestamp.

**Requirements:**
- `sourceAccount` exists in the concept's state.

**Effects:**
- If an ExternalAssignment exists with `source = sourceAccount` and `externalId = externalId`:
    - Updates its `internalAssignment` to `internalId` and `lastExternalModificationTimestamp` to `externalModificationTimestamp`.
- Otherwise:
    - Creates a new ExternalAssignment with `source = sourceAccount`, `externalId = externalId`, `internalAssignment = internalId`, and `lastExternalModificationTimestamp = externalModificationTimestamp`.

**Request Body:**
```json
{
  "sourceAccount": "string",
  "externalId": "string",
  "internalId": "string",
  "externalModificationTimestamp": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/ExternalAssignmentSync/getSourcesForUser

**Description:** Retrieves all external source accounts connected by a specific user.

**Requirements:**
- `user` exists in the system (implicitly, as a generic parameter).

**Effects:**
- Returns an array of all `ExternalSourceAccount` entities where `owner` is `user`.

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "owner": "string",
    "sourceType": "string",
    "sourceName": "string",
    "connectionDetails": {
      "apiToken": "string",
      "baseUrl": "string"
    },
    "lastSuccessfulPoll": "string | null"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/ExternalAssignmentSync/getMappedInternalId

**Description:** Retrieves the internal assignment ID corresponding to a given external assignment ID and source.

**Requirements:**
- An ExternalAssignment exists with `source = sourceAccount` and `externalId = externalId`.
- (Implicit for error cases) No ExternalAssignment exists with `source = sourceAccount` and `externalId = externalId`.

**Effects:**
- Returns the `internalAssignment` from the matching ExternalAssignment.
- (Implicit for error cases) Returns error message "External assignment with ID '...' not found for source '...'".

**Request Body:**
```json
{
  "externalId": "string",
  "sourceAccount": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "internalId": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/ExternalAssignmentSync/getAssignmentsForSource

**Description:** Retrieves all external assignments currently synced for a specific external source account.

**Requirements:**
- `sourceAccount` exists in the concept's state.
- (Implicit for error cases) `sourceAccount` does NOT exist in the concept's state.

**Effects:**
- Returns an array of all ExternalAssignments where `source = sourceAccount`.
- (Implicit for error cases) Returns error message "Source account not found".

**Request Body:**
```json
{
  "sourceAccount": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "source": "string",
    "externalId": "string",
    "internalAssignment": "string",
    "lastExternalModificationTimestamp": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

## TodoList

### POST /api/TodoList/createList

**Description:** Creates a new todo list for a user with specified name, time scope, auto-clear, and recurrence settings.

**Requirements:**
- name is non-empty
- for all existing L in Lists, if L.owner == owner then L.name != name
- if both startTime and endTime are provided, startTime <= endTime
- if recurrenceType is not none, both startTime and endTime must be provided

**Effects:**
- A new list is created with the provided name, owner, and settings.
- If time boundaries are not provided, startTime defaults to MIN\_DATE and endTime defaults to MAX\_DATE (making the list always active).
- If time boundaries are provided, the list is scoped to that time range.
- The autoClearCompleted flag determines whether completed items are automatically cleared.
- The recurrenceType determines if and how the list recreates itself.
- The list starts with an empty set of items and is returned.

**Request Body:**
```json
{
  "owner": "string",           // User ID
  "name": "string",
  "startTime": "string | null", // ISO 8601 date-time, optional
  "endTime": "string | null",   // ISO 8601 date-time, optional
  "autoClearCompleted": "boolean",
  "recurrenceType": "string"   // "none" | "daily" | "weekly" | "monthly"
}
```

**Success Response Body (Action):**
```json
{
  "list": "string"             // ID of the created List
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/addListItem

**Description:** Adds an item to an existing todo list, optionally with a due date, respecting the list's time scope.

**Requirements:**
- list exists
- item is not already in list.items
- if list has startTime and itemDueDate is provided, itemDueDate >= list.startTime
- if list has endTime and itemDueDate is provided, itemDueDate <= list.endTime

**Effects:**
- The item is added to the list's set of items.
- If the list has time constraints and the item has a due date, the item is only added if it falls within the list's time range.

**Request Body:**
```json
{
  "list": "string",            // List ID
  "item": "string",            // Item ID
  "itemDueDate": "string | null" // ISO 8601 date-time, optional
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/removeListItem

**Description:** Removes a specified item from a todo list.

**Requirements:**
- list exists AND item is in list.items

**Effects:**
- The item is removed from the list's set of items.

**Request Body:**
```json
{
  "list": "string", // List ID
  "item": "string"  // Item ID
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/markItemCompleted

**Description:** Updates the completion status of an item within a specific todo list.

**Requirements:**
- list exists AND item is in list.items

**Effects:**
- The completion status of the item in the list is updated to the provided value.

**Request Body:**
```json
{
  "list": "string",    // List ID
  "item": "string",    // Item ID
  "completed": "boolean"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/deleteList

**Description:** Deletes an existing todo list.

**Requirements:**
- list exists

**Effects:**
- The list is removed from the set of all lists.

**Request Body:**
```json
{
  "list": "string" // List ID
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/clearCompletedItems

**Description:** Removes all items marked as completed from a specific todo list.

**Requirements:**
- list exists

**Effects:**
- All items in the list where itemCompleted is true are removed from the list's items set.

**Request Body:**
```json
{
  "list": "string" // List ID
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/updateListSettings

**Description:** Updates the auto-clear and/or recurrence settings of an existing todo list.

**Requirements:**
- list exists
- if recurrenceType is provided and is not none, list must have both startTime and endTime

**Effects:**
- If autoClearCompleted is provided, the list's autoClearCompleted flag is updated.
- If recurrenceType is provided, the list's recurrenceType is updated.

**Request Body:**
```json
{
  "list": "string",              // List ID
  "autoClearCompleted": "boolean | null", // Optional
  "recurrenceType": "string | null"     // "none" | "daily" | "weekly" | "monthly", optional
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/autoClearIfNeeded

**Description:** (System Action) Automatically clears completed items from a list if its autoClearCompleted setting is true and its end time has passed.

**Requirements:**
- list exists
- list.autoClearCompleted is true
- current time is after list.endTime

**Effects:**
- Removes all items in the list where itemCompleted is true.

**Request Body:**
```json
{
  "list": "string" // List ID
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/recreateRecurringList

**Description:** (System Action) Creates a new list for the next recurrence period if the current list is recurring and its end time has passed.

**Requirements:**
- list exists
- list.recurrenceType is not none
- current time is after list.endTime

**Effects:**
- A new list is created with the same name, owner, autoClearCompleted, and recurrenceType settings.
- The new list's time range is calculated based on the recurrenceType while maintaining the original list's duration (daily: +1 day, weekly: +1 week, monthly: +1 month).
- All uncompleted items from the old list are carried over to the new list with their due dates adjusted by the time shift.
- The original list remains unchanged (archived).

**Request Body:**
```json
{
  "list": "string" // List ID
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/getListsForUser

**Description:** Retrieves all todo lists owned by a specified user.

**Requirements:**
- user is valid

**Effects:**
- Returns the set of all lists owned by the specified user.

**Request Body:**
```json
{
  "user": "string" // User ID
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "owner": "string",            // User ID
    "items": ["string"],          // Array of Item IDs
    "startTime": "string",        // ISO 8601 date-time
    "endTime": "string",          // ISO 8601 date-time
    "autoClearCompleted": "boolean",
    "recurrenceType": "string"    // "none" | "daily" | "weekly" | "monthly"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/getListByName

**Description:** Retrieves a specific todo list by its name for a given user.

**Requirements:**
- user is valid, name is non-empty, list with name exists for user

**Effects:**
- Returns the list with the specified name owned by the user.

**Request Body:**
```json
{
  "user": "string", // User ID
  "name": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "owner": "string",            // User ID
    "items": ["string"],          // Array of Item IDs
    "startTime": "string",        // ISO 8601 date-time
    "endTime": "string",          // ISO 8601 date-time
    "autoClearCompleted": "boolean",
    "recurrenceType": "string"    // "none" | "daily" | "weekly" | "monthly"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/TodoList/getActiveListsForUser

**Description:** Retrieves all active todo lists owned by a user, where "active" means the current time falls within the list's defined time range.

**Requirements:**
- user is valid

**Effects:**
- Returns the set of all lists owned by the user where current time is between startTime and endTime (inclusive).
- Lists created without explicit time ranges use MIN\_DATE/MAX\_DATE and are always active.

**Request Body:**
```json
{
  "user": "string" // User ID
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "owner": "string",            // User ID
    "items": ["string"],          // Array of Item IDs
    "startTime": "string",        // ISO 8601 date-time
    "endTime": "string",          // ISO 8601 date-time
    "autoClearCompleted": "boolean",
    "recurrenceType": "string"    // "none" | "daily" | "weekly" | "monthly"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

## UserAuthentication

### POST /api/UserAuthentication/register

**Description:** Registers a new user with a unique username and password.

**Requirements:**
- The provided username must not already exist.

**Effects:**
- A new User is created.
- The new User's username is set to the input username.
- The new User's hashedPassword is set to the hash of the input password.
- The new User's additionalCredentials map is initialized as empty.
- The identifier of the newly created User is returned.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with provided credentials and establishes a new session.

**Requirements:**
- A User must exist with the provided username and their hashed password must match the hash of the provided password.

**Effects:**
- The User matching the username is found.
- A new unique sessionToken is created.
- A new active session linking the found User and the new sessionToken is added to activeSessions.
- The new sessionToken is returned.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "sessionToken": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/logout

**Description:** Terminates an active user session by invalidating its token.

**Requirements:**
- An active session must exist with the provided sessionToken.

**Effects:**
- The active session with the matching sessionToken is removed from activeSessions.
- A success boolean is returned.

**Request Body:**
```json
{
  "sessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/getCurrentUser

**Description:** Retrieves the identifier of the authenticated user for a given active session.

**Requirements:**
- An active session must exist with the provided sessionToken.

**Effects:**
- The user associated with the matching sessionToken is found.
- The identifier of the found user is returned.

**Request Body:**
```json
{
  "sessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/storeCredential

**Description:** Saves an additional credential for the authenticated user under a specified type.

**Requirements:**
- An active session must exist with the provided sessionToken.
- The credentialType must not be an empty string.

**Effects:**
- The user associated with the matching sessionToken is found.
- The user's additionalCredentials map is updated with the credentialType and credentialValue.
- A success boolean is returned.

**Request Body:**
```json
{
  "sessionToken": "string",
  "credentialType": "string",
  "credentialValue": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/retrieveCredential

**Description:** Fetches a specific additional credential associated with the authenticated user and a given type.

**Requirements:**
- An active session must exist with the provided sessionToken.
- The user associated with the sessionToken must have an additional credential stored under the given credentialType.

**Effects:**
- The user associated with the matching sessionToken is found.
- The credentialValue for the specified credentialType is returned.

**Request Body:**
```json
{
  "sessionToken": "string",
  "credentialType": "string"
}
```

**Success Response Body (Action):**
```json
{
  "credentialValue": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/updateCredential

**Description:** Modifies an existing additional credential for the authenticated user.

**Requirements:**
- An active session must exist with the provided sessionToken.
- The credentialType must not be an empty string.
- The user associated with the sessionToken must already have an additional credential stored under the given credentialType.

**Effects:**
- The user associated with the matching sessionToken is found.
- The user's additionalCredentials map is updated with the newCredentialValue for the specified credentialType.
- A success boolean is returned.

**Request Body:**
```json
{
  "sessionToken": "string",
  "credentialType": "string",
  "newCredentialValue": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/deleteCredential

**Description:** Removes a specific additional credential from the authenticated user's stored credentials.

**Requirements:**
- An active session must exist with the provided sessionToken.
- The user associated with the sessionToken must have an additional credential stored under the given credentialType.

**Effects:**
- The user associated with the matching sessionToken is found.
- The specified credentialType and its value are removed from the user's additionalCredentials.
- A success boolean is returned.

**Request Body:**
```json
{
  "sessionToken": "string",
  "credentialType": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/UserAuthentication/getCredentialTypes

**Description:** Lists all credential types stored for the authenticated user.

**Requirements:**
- An active session must exist with the provided sessionToken.

**Effects:**
- The user associated with the matching sessionToken is found.
- A set of all credential types (keys) from the user's additionalCredentials is returned.

**Request Body:**
```json
{
  "sessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "types": [
    "string"
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```