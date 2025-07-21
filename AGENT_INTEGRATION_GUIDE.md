# 🤖 Agent Integration Guide - Ski Instructor Booking Platform

## 🌟 Multi-Agent Development Architecture

This platform was built using a **revolutionary multi-agent approach** where 15+ specialized AI agents work in parallel via git worktrees. This guide helps new agents and engineers integrate seamlessly with the existing system.

## 🏗️ Worktree Architecture Overview

### Current Agent Distribution
```
instructors/
├── worktrees/
│   ├── backend-api/           ✅ COMPLETE - Core API & Authentication
│   ├── database-design/       ✅ COMPLETE - PostgreSQL Schema & Redis  
│   ├── frontend-core/         ✅ COMPLETE - Next.js Web Application
│   ├── authentication/        ✅ COMPLETE - Multi-role Auth & OAuth
│   ├── instructor-management/ ✅ COMPLETE - Profiles & Onboarding
│   ├── booking-engine/        ✅ COMPLETE - AI Matching & Pricing
│   ├── payment-system/        ✅ COMPLETE - Stripe Connect & Finance
│   ├── calendar-integration/  ✅ COMPLETE - Multi-calendar Sync
│   ├── mobile-app/           ✅ COMPLETE - React Native App
│   ├── admin-dashboard/       ✅ COMPLETE - Resort Management
│   ├── ai-ml/                ✅ COMPLETE - Machine Learning Models
│   ├── weather-integration/   ✅ COMPLETE - Safety & Rescheduling
│   ├── communication/         ✅ COMPLETE - Messaging & Notifications
│   ├── analytics/            ✅ COMPLETE - Business Intelligence
│   └── integration/          ✅ COMPLETE - Third-party APIs
├── shared/                   # Cross-agent shared code
└── docs/                     # Documentation hub
```

## 🚀 Quick Start for New Agents

### 1. Repository Access
```bash
# Clone the main repository
git clone https://github.com/cyperx84/ski-instructor-booking-platform.git
cd ski-instructor-booking-platform

# Install root dependencies
npm install

# List all available worktrees
git worktree list
```

### 2. Working with Specific Worktrees
```bash
# Navigate to your assigned worktree
cd worktrees/[your-agent-name]

# Install worktree-specific dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Check code quality
npm run lint && npm run typecheck
```

### 3. Understanding Shared Resources
```bash
# Shared types and interfaces
ls shared/types.ts

# Shared utilities and business logic
ls shared/utils.ts

# Shared constants and configuration
ls shared/constants.ts
```

## 🔧 Agent Integration Patterns

### Cross-Worktree Communication
- **Shared Types**: All agents MUST use types from `shared/types.ts`
- **API Contracts**: Backend agents expose RESTful APIs with OpenAPI specs
- **Event-Driven**: Real-time communication via WebSocket events
- **Database**: Centralized PostgreSQL with agent-specific schemas

### Integration Checklist
- [ ] Import shared types for data consistency
- [ ] Follow established API patterns and naming conventions
- [ ] Add appropriate error handling and logging
- [ ] Write comprehensive unit and integration tests
- [ ] Update shared documentation when modifying interfaces
- [ ] Coordinate database schema changes with database-design agent

## 📊 Agent-Specific Integration Details

### Backend API Agents
```bash
cd worktrees/backend-api

# Key integration points:
# - Express.js with TypeScript
# - JWT authentication middleware
# - PostgreSQL connection pools
# - Redis caching strategies
# - Winston logging configuration

# Development commands:
npm run dev          # Hot reload development
npm run test         # Jest with coverage
npm run build        # Production build
npm run typecheck    # TypeScript validation
```

### Frontend Agents  
```bash
cd worktrees/frontend-core/frontend

# Key integration points:
# - Next.js 15 with React 18
# - Tailwind CSS design system
# - Zustand state management
# - React Query for server state
# - TypeScript throughout

# Development commands:
npm run dev          # Next.js with turbopack
npm run build        # Production build
npm run lint         # ESLint validation
```

### Mobile App Agents
```bash
cd worktrees/mobile-app

# Key integration points:
# - React Native with Expo
# - Redux for state management
# - Offline-first architecture
# - Push notifications
# - Biometric authentication

# Development commands:
npm run start        # Expo development server
npm run android      # Android development
npm run ios          # iOS development
```

### AI/ML Agents
```bash
cd worktrees/ai-ml

# Key integration points:
# - Python ML models with Node.js APIs
# - TensorFlow.js for client-side inference
# - Real-time prediction services
# - Feature engineering pipelines
# - Model versioning and deployment

# Development commands:
npm run dev          # Node.js API development
python train.py      # Model training
npm run serve        # Model serving API
```

## 🔐 Security & Compliance Integration

### Authentication Flow
```typescript
// All agents must use shared auth patterns
import { AuthMiddleware, JWTPayload } from '../shared/types';

// Multi-role authorization
const roles = ['client', 'instructor', 'resort_admin', 'super_admin'];

// JWT token validation
app.use(AuthMiddleware.validateToken);
app.use(AuthMiddleware.authorizeRole(['instructor', 'resort_admin']));
```

### Data Protection
- **PCI DSS Compliance**: Payment data handled only by payment-system agent
- **GDPR Compliance**: Personal data encryption and deletion workflows
- **OWASP Standards**: Input validation, XSS protection, CSRF tokens
- **Rate Limiting**: Implemented across all public endpoints

## 📡 API Integration Standards

### RESTful Conventions
```typescript
// Standard API response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Error handling pattern
throw new APIError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
```

### WebSocket Events
```typescript
// Real-time event patterns
interface WebSocketEvent {
  type: 'booking_created' | 'instructor_available' | 'weather_alert';
  payload: any;
  timestamp: string;
  userId: string;
}
```

## 🧪 Testing Integration

### Cross-Agent Testing
```bash
# Root-level integration tests
npm run test:integration

# Test specific worktree interactions
cd worktrees/booking-engine
npm run test:integration

# Performance testing
npm run test:performance

# Security testing
npm run test:security
```

### Test Patterns
```typescript
// Shared test utilities
import { testDb, mockAuth, apiClient } from '../shared/test-utils';

describe('Agent Integration', () => {
  beforeEach(async () => {
    await testDb.reset();
    mockAuth.setUser(mockInstructor);
  });

  it('should integrate with payment system', async () => {
    const booking = await apiClient.post('/bookings', bookingData);
    expect(booking.paymentStatus).toBe('pending');
  });
});
```

## 🔄 Deployment Integration

### Environment Configuration
```bash
# Each agent has environment-specific configs
cp .env.example .env.development
cp .env.example .env.staging  
cp .env.example .env.production

# Shared environment variables
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

### Container Integration
```dockerfile
# Agents follow standardized Dockerfile patterns
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Development Workflow for New Agents

### 1. Agent Onboarding
1. **Review Documentation**: Read README.md, CLAUDE.md, and this guide
2. **Understand Architecture**: Study the worktree structure and shared patterns
3. **Setup Environment**: Clone repository, install dependencies, configure env
4. **Run Existing Tests**: Ensure current system works on your environment
5. **Identify Integration Points**: Review how your agent connects to others

### 2. Development Process
1. **Create Feature Branch**: `git checkout -b feature/your-enhancement`
2. **Work in Worktree**: Develop within your assigned worktree directory
3. **Use Shared Resources**: Import from shared/ directory for consistency  
4. **Write Tests**: Unit tests for your code, integration tests for connections
5. **Update Documentation**: Modify relevant README files and API docs

### 3. Integration Testing
1. **Local Integration**: Test your changes with related agents locally
2. **Shared Type Updates**: Coordinate any shared interface changes
3. **Cross-Agent Testing**: Run integration test suites
4. **Performance Testing**: Ensure no performance regressions
5. **Security Testing**: Validate security standards compliance

### 4. Deployment Process
1. **Code Review**: Have other agents review integration points
2. **Staging Deployment**: Deploy to staging environment
3. **End-to-End Testing**: Complete user workflow testing
4. **Production Deployment**: Deploy with monitoring and rollback plans
5. **Post-Deploy Monitoring**: Watch metrics and error rates

## 🚨 Critical Integration Points

### Database Schema Coordination
```sql
-- All schema changes must coordinate with database-design agent
-- Example: Adding new table that affects multiple agents

CREATE TABLE lesson_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES bookings(id),
  instructor_id UUID REFERENCES instructors(id),
  performance_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notify affected agents: booking-engine, analytics, instructor-management
```

### Shared Type Definitions
```typescript
// shared/types.ts - Central source of truth
export interface Booking {
  id: string;
  instructorId: string;
  clientId: string;
  status: BookingStatus;
  scheduledAt: Date;
  price: number;
  paymentStatus: PaymentStatus;
}

// All agents import and extend these base types
import { Booking } from '../shared/types';
```

### Event-Driven Communication
```typescript
// Real-time event system for agent coordination
interface AgentEvent {
  source: string;           // 'booking-engine', 'payment-system', etc.
  target: string[];         // ['analytics', 'mobile-app']
  type: string;            // 'booking_confirmed', 'payment_processed'
  payload: any;
  timestamp: string;
}
```

## 📞 Agent Communication Channels

### Development Coordination
- **GitHub Issues**: Use for feature requests and bug reports
- **Pull Requests**: Code review and integration discussions  
- **Documentation Updates**: Keep README files current
- **Integration Testing**: Coordinate testing schedules

### Emergency Protocols
- **Production Issues**: Immediate Slack notification to all agents
- **Security Incidents**: Follow established security response procedures
- **Database Changes**: 24-hour notice required for schema modifications
- **API Breaking Changes**: Coordinate with all dependent agents

## 🎯 Success Metrics for Agent Integration

### Integration Quality Metrics
- **Test Coverage**: >90% for integration points
- **API Response Times**: <200ms for critical endpoints
- **Error Rates**: <0.1% for production APIs
- **Documentation Coverage**: 100% for public interfaces

### Business Impact Metrics
- **Booking Completion Rate**: Target 90%+
- **User Satisfaction**: 4.8+ stars average
- **Platform Uptime**: 99.9%+ availability
- **Performance**: Support 10,000+ concurrent users

## 📚 Resources for New Agents

### Documentation Hierarchy
1. **README.md** - Project overview and quick start
2. **CLAUDE.md** - Comprehensive development guide
3. **AGENT_INTEGRATION_GUIDE.md** - This document
4. **PROJECT_STATUS.md** - Current state and roadmap
5. **Worktree READMEs** - Agent-specific implementation details

### External Resources
- [Multi-Agent Development Best Practices](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-git-worktrees)
- [TypeScript Integration Patterns](https://www.typescriptlang.org/docs/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
- [PostgreSQL Multi-Tenant Patterns](https://www.postgresql.org/docs/current/ddl-schemas.html)

---

## 🏆 Welcome to the Team!

This platform represents the future of instructor booking systems, built with cutting-edge multi-agent methodology. Your contribution will help revolutionize how ski and snowboard instructors connect with clients.

**Ready to integrate?** Start with `npm run dev` and join the most advanced booking platform ever created.

*🎿 Built with ❤️ for the skiing and snowboarding community*