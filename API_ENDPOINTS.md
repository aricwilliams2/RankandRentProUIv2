# API Endpoints for Call Logs and Lead Updates

## Overview
This document outlines the API endpoints that need to be implemented on the backend to support call logging functionality and proper lead status updates.

## Lead Update Endpoints

### Update Lead Contacted Status
- **Endpoint**: `PUT /api/leads/{id}`
- **Description**: Updates the contacted status of a lead
- **Request Body**:
```json
{
  "contacted": true
}
```
- **Response**: Updated lead object

## Call Log Endpoints

### 1. Create Call Log
- **Endpoint**: `POST /api/call-logs`
- **Description**: Creates a new call log entry for a lead
- **Request Body**:
```json
{
  "lead_id": "123",
  "outcome": "follow_up_1_day",
  "notes": "Called the client, they were interested in our services",
  "next_follow_up": "2024-01-20T10:00:00Z",
  "duration": 300
}
```
- **Response**:
```json
{
  "id": "456",
  "lead_id": "123",
  "outcome": "follow_up_1_day",
  "notes": "Called the client, they were interested in our services",
  "next_follow_up": "2024-01-20T10:00:00Z",
  "duration": 300,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2. Update Call Log
- **Endpoint**: `PUT /api/call-logs/{id}`
- **Description**: Updates an existing call log entry
- **Request Body**:
```json
{
  "outcome": "follow_up_72_hours",
  "notes": "Updated notes about the call",
  "next_follow_up": "2024-01-18T10:00:00Z"
}
```
- **Response**: Updated call log object

### 3. Get Call Logs for Lead
- **Endpoint**: `GET /api/leads/{lead_id}/call-logs`
- **Description**: Retrieves all call logs for a specific lead
- **Response**:
```json
{
  "data": [
    {
      "id": "456",
      "lead_id": "123",
      "outcome": "follow_up_1_day",
      "notes": "Called the client, they were interested in our services",
      "next_follow_up": "2024-01-20T10:00:00Z",
      "duration": 300,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Delete Call Log
- **Endpoint**: `DELETE /api/call-logs/{id}`
- **Description**: Deletes a call log entry
- **Response**: Success message or 204 No Content

## Database Schema

### Call Logs Table
```sql
CREATE TABLE call_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT UNSIGNED NOT NULL,
    outcome ENUM('follow_up_1_day', 'follow_up_72_hours', 'follow_up_next_week', 'follow_up_next_month', 'follow_up_3_months') NOT NULL,
    notes TEXT,
    next_follow_up DATETIME NULL,
    duration INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
```

### Leads Table Update
Ensure the `leads` table has a `contacted` field:
```sql
ALTER TABLE leads ADD COLUMN contacted BOOLEAN DEFAULT FALSE;
```

## Node.js/Express Implementation

### CallLog Model (if using Sequelize)
```javascript
// models/CallLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallLog = sequelize.define('CallLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  lead_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'leads',
      key: 'id'
    }
  },
  outcome: {
    type: DataTypes.ENUM('follow_up_1_day', 'follow_up_72_hours', 'follow_up_next_week', 'follow_up_next_month', 'follow_up_3_months'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  next_follow_up: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'call_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CallLog;
```

### CallLog Controller
```javascript
// controllers/callLogController.js
const CallLog = require('../models/CallLog');
const Lead = require('../models/Lead');

const callLogController = {
  // Create a new call log
  async create(req, res) {
    try {
      const { lead_id, outcome, notes, next_follow_up, duration } = req.body;

      // Validate required fields
      if (!lead_id || !outcome || !notes) {
        return res.status(400).json({
          success: false,
          message: 'lead_id, outcome, and notes are required'
        });
      }

      // Check if lead exists
      const lead = await Lead.findByPk(lead_id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      // Create call log
      const callLog = await CallLog.create({
        lead_id,
        outcome,
        notes,
        next_follow_up,
        duration: duration || 0
      });

      res.status(201).json({
        success: true,
        data: callLog
      });
    } catch (error) {
      console.error('Error creating call log:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update a call log
  async update(req, res) {
    try {
      const { id } = req.params;
      const { outcome, notes, next_follow_up } = req.body;

      const callLog = await CallLog.findByPk(id);
      if (!callLog) {
        return res.status(404).json({
          success: false,
          message: 'Call log not found'
        });
      }

      // Update call log
      await callLog.update({
        outcome,
        notes,
        next_follow_up
      });

      res.json({
        success: true,
        data: callLog
      });
    } catch (error) {
      console.error('Error updating call log:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete a call log
  async delete(req, res) {
    try {
      const { id } = req.params;

      const callLog = await CallLog.findByPk(id);
      if (!callLog) {
        return res.status(404).json({
          success: false,
          message: 'Call log not found'
        });
      }

      await callLog.destroy();

      res.json({
        success: true,
        message: 'Call log deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting call log:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get call logs for a lead
  async getByLead(req, res) {
    try {
      const { lead_id } = req.params;

      const callLogs = await CallLog.findAll({
        where: { lead_id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: callLogs
      });
    } catch (error) {
      console.error('Error fetching call logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = callLogController;
```

### Lead Controller Update
```javascript
// controllers/leadController.js

// Add this method to your existing lead controller
const leadController = {
  // ... existing methods ...

  // Update lead (including contacted status)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { contacted, ...otherFields } = req.body;

      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      // Update lead with all provided fields
      await lead.update({
        contacted,
        ...otherFields
      });

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get call logs for a lead
  async getCallLogs(req, res) {
    try {
      const { id } = req.params;

      const callLogs = await CallLog.findAll({
        where: { lead_id: id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: callLogs
      });
    } catch (error) {
      console.error('Error fetching call logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
```

### Routes
```javascript
// routes/callLogs.js
const express = require('express');
const router = express.Router();
const callLogController = require('../controllers/callLogController');
const auth = require('../middleware/auth'); // Your auth middleware

// Apply auth middleware to all routes
router.use(auth);

// Call log routes
router.post('/', callLogController.create);
router.put('/:id', callLogController.update);
router.delete('/:id', callLogController.delete);

module.exports = router;
```

```javascript
// routes/leads.js
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Lead routes
router.put('/:id', leadController.update);
router.get('/:id/call-logs', leadController.getCallLogs);

module.exports = router;
```

```javascript
// app.js or server.js
const express = require('express');
const app = express();

// Import routes
const callLogRoutes = require('./routes/callLogs');
const leadRoutes = require('./routes/leads');

// Use routes
app.use('/api/call-logs', callLogRoutes);
app.use('/api/leads', leadRoutes);
```

## Testing the Implementation

### Test Lead Update
```bash
curl -X PUT http://localhost:3000/api/leads/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"contacted": true}'
```

### Test Create Call Log
```bash
curl -X POST http://localhost:3000/api/call-logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "lead_id": "1",
    "outcome": "follow_up_1_day",
    "notes": "Called the client, they were interested",
    "next_follow_up": "2024-01-20T10:00:00Z",
    "duration": 300
  }'
```

### Test Get Call Logs
```bash
curl -X GET http://localhost:3000/api/leads/1/call-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration Notes

1. **Toggle Contact Status**: The frontend now sends a direct PUT request to update the `contacted` field
2. **Call Logs**: All call log operations now go through dedicated API endpoints
3. **Error Handling**: The frontend includes proper error handling for all API calls
4. **Data Synchronization**: Call logs are fetched when leads are loaded and updated in real-time

## Database Migration (if using Sequelize)

```javascript
// migrations/YYYYMMDDHHMMSS-create-call-logs.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('call_logs', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      lead_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'leads',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      outcome: {
        type: Sequelize.ENUM('follow_up_1_day', 'follow_up_72_hours', 'follow_up_next_week', 'follow_up_next_month', 'follow_up_3_months'),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      next_follow_up: {
        type: Sequelize.DATE,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('call_logs');
  }
};
```

## Alternative: Raw SQL Implementation

If you're not using an ORM, here's how to implement with raw SQL:

```javascript
// controllers/callLogController.js (Raw SQL version)
const db = require('../config/database'); // Your database connection

const callLogController = {
  async create(req, res) {
    try {
      const { lead_id, outcome, notes, next_follow_up, duration } = req.body;

      const query = `
        INSERT INTO call_logs (lead_id, outcome, notes, next_follow_up, duration)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        lead_id, outcome, notes, next_follow_up, duration || 0
      ]);

      const callLog = {
        id: result.insertId,
        lead_id,
        outcome,
        notes,
        next_follow_up,
        duration: duration || 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: callLog
      });
    } catch (error) {
      console.error('Error creating call log:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getByLead(req, res) {
    try {
      const { lead_id } = req.params;

      const query = `
        SELECT * FROM call_logs 
        WHERE lead_id = ? 
        ORDER BY created_at DESC
      `;
      
      const [callLogs] = await db.execute(query, [lead_id]);

      res.json({
        success: true,
        data: callLogs
      });
    } catch (error) {
      console.error('Error fetching call logs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
``` 