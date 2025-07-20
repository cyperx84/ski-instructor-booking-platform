#!/bin/bash

# Setup git worktrees for parallel development by sub-agents

echo "🔧 Setting up git worktrees for sub-agent development..."

# Create main development branches
git branch -M main
git checkout -b development

# Phase 1: Foundation branches
echo "📦 Creating Phase 1 branches..."
git checkout -b backend-api-agent
git checkout -b database-design-agent  
git checkout -b frontend-core-agent
git checkout -b authentication-agent

# Phase 2: Core Features branches
echo "🎯 Creating Phase 2 branches..."
git checkout -b instructor-management-agent
git checkout -b booking-engine-agent
git checkout -b payment-system-agent
git checkout -b calendar-integration-agent
git checkout -b mobile-app-agent
git checkout -b admin-dashboard-agent

# Phase 3: Advanced Features branches  
echo "🚀 Creating Phase 3 branches..."
git checkout -b ai-ml-agent
git checkout -b weather-integration-agent
git checkout -b communication-agent
git checkout -b analytics-agent
git checkout -b integration-agent

# Return to main branch
git checkout main

# Create worktree directories
mkdir -p worktrees

# Setup Phase 1 worktrees
echo "🌳 Setting up Phase 1 worktrees..."
git worktree add worktrees/backend-api backend-api-agent
git worktree add worktrees/database-design database-design-agent
git worktree add worktrees/frontend-core frontend-core-agent  
git worktree add worktrees/authentication authentication-agent

# Setup Phase 2 worktrees
echo "🌳 Setting up Phase 2 worktrees..."
git worktree add worktrees/instructor-management instructor-management-agent
git worktree add worktrees/booking-engine booking-engine-agent
git worktree add worktrees/payment-system payment-system-agent
git worktree add worktrees/calendar-integration calendar-integration-agent
git worktree add worktrees/mobile-app mobile-app-agent
git worktree add worktrees/admin-dashboard admin-dashboard-agent

# Setup Phase 3 worktrees
echo "🌳 Setting up Phase 3 worktrees..."
git worktree add worktrees/ai-ml ai-ml-agent
git worktree add worktrees/weather-integration weather-integration-agent
git worktree add worktrees/communication communication-agent
git worktree add worktrees/analytics analytics-agent
git worktree add worktrees/integration integration-agent

echo "✅ Worktrees setup complete!"
echo "📋 Available worktrees:"
git worktree list

echo ""
echo "🤖 Sub-agents can now work in parallel:"
echo "  - Phase 1: worktrees/backend-api, worktrees/database-design, worktrees/frontend-core, worktrees/authentication"
echo "  - Phase 2: worktrees/instructor-management, worktrees/booking-engine, worktrees/payment-system, etc."
echo "  - Phase 3: worktrees/ai-ml, worktrees/weather-integration, worktrees/communication, etc."