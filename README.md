# PLMS - Pathology Lab Management System

## Overview

PLMS is a comprehensive Pathology Lab Management System designed to streamline and automate laboratory operations. This system handles everything from patient registration to report generation, machine integration, billing, and analytics.

## Features

- Authentication & User Roles
- Master Management (Tests, Panels, Doctors, Patients, etc.)
- Sample Management
- Machine Integration (LIS)
- Report & PDF System
- Communication Automation
- Analytics Dashboard
- Billing & Finance
- Admin Panel Tools
- Hospital Integration
- White-labeling

For a detailed feature list, see [Feature Documentation](./Docs/context.md).

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **PDF Generation**: PDF.js
- **Machine Integration**: Python bridge service

## Project Structure

```
PLMS/
├── client/             # Frontend React application
├── server/             # Backend Node.js API
├── bridge/             # Python bridge for machine integration
├── Docs/               # Documentation
└── scripts/            # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Python 3.8+ (for machine integration)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for each component
3. Configure environment variables
4. Start the development servers

Detailed installation instructions will be provided in each component's directory.

## Development Roadmap

See our [Development Roadmap](./Docs/roadmap.md) for the planned implementation schedule.

## License

This project is proprietary software. All rights reserved.

## Contact

For inquiries, please contact [your-email@example.com](mailto:your-email@example.com).