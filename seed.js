const { sequelize, Slide } = require('./models');

const slidesData = [
  {
    id: 1,
    title: "Project Overview",
    content: `# PowerPoint Clone Web Application

## Full-Stack Presentation Platform

**Built with Modern Technology Stack**

• Next.js 14 with React 18
• TypeScript for type safety
• Tailwind CSS for styling
• Sequelize ORM with SQLite
• Vercel frontend deployment
• Railway backend deployment

*Stripped-down PowerPoint with Markdown support*`,
    order: 1
  },
  {
    id: 2,
    title: "Architecture Overview",
    content: `# System Architecture

## Separated Frontend and Backend

**Frontend Layer**
• Next.js React application
• Deployed on Vercel platform
• Client-side routing and state management
• Real-time markdown parsing

**Backend Layer**
• Express.js API server
• Deployed on Railway platform`,
    order: 2
  },
  {
    id: 3,
    title: "Technology Decisions",
    content: `# Key Technology Choices

## Strategic Framework Selection

**Next.js Benefits**
• Server-side rendering capability
• Built-in optimization features
• Seamless Vercel integration

**Tailwind CSS Advantages**
• Minimal external dependencies
• Consistent design system
• Reduced CSS file complexity`,
    order: 3
  },
  {
    id: 4,
    title: "Database Design",
    content: `# Data Architecture

## SQLite with Sequelize ORM

**Database Schema**
• Slides table with core fields
• Order-based slide sequencing
• Markdown content storage
• Efficient querying patterns

**ORM Benefits**
• Type-safe database operations
• Migration management
• Model validation and relationships`,
    order: 4
  },
  {
    id: 5,
    title: "Frontend Implementation",
    content: `# Frontend Architecture

## Component-Based Design

**Core Components**
• SlideViewer for presentation display
• MarkdownEditor for content editing
• NavigationControls for user interaction
• ProgressBar for visual feedback
• DragDropInterface for slide reordering

**State Management**
• React hooks for local state
• Context API for global state management`,
    order: 5
  },
  {
    id: 6,
    title: "Markdown Processing",
    content: `# Markdown to AST Pipeline

## Custom Parsing Implementation

**Processing Flow**
• Markdown input validation
• AST generation from source content
• Component tree rendering
• Syntax highlighting integration

**Advanced Features**
• Language-specific code highlighting
• Professional formatting
• Custom markdown extensions support`,
    order: 6
  },
  {
    id: 7,
    title: "User Experience Features",
    content: `# Enhanced User Experience

## Navigation and Interaction

**Keyboard Navigation**
• Arrow keys for slide movement
• Spacebar for presentation mode
• ESC key for editor toggle

**Drag and Drop Functionality**
• Intuitive slide reordering
• Visual feedback during operations
• Persistent order changes`,
    order: 7
  },
  {
    id: 8,
    title: "CRUD Operations",
    content: `# Complete Slide Management

## Full Create, Read, Update, Delete

**Slide Creation**
• Dynamic slide addition
• Real-time content preview
• Automatic order assignment

**Slide Editing**
• In-place content modification
• Live markdown rendering
• Auto-save functionality
`,
    order: 8
  },
  {
    id: 9,
    title: "API Design",
    content: `# RESTful API Architecture

## Backend Service Endpoints

**Core API Routes**
• GET /api/slides - Retrieve all slides
• POST /api/slides - Create new slide
• PUT /api/slides/:id - Update slide content
• DELETE /api/slides/:id - Remove slide
• PATCH /api/slides/reorder - Update slide order

**Data Validation**
• Error handling middleware
• Response standardization`,
    order: 9
  },
  {
    id: 10,
    title: "Design Considerations",
    content: `# Design Philosophy

## Scalability and Maintainability

**Modular Architecture**
• Component separation of concerns
• Reusable UI elements
• Clean code organization
• Extensible markdown parser

**Performance Considerations**
• Efficient re-rendering strategies
• Optimized database queries
• Bundle size optimization`,
    order: 10
  },
  {
    id: 11,
    title: "Deployment Strategy",
    content: `# Two-Platform Deployment

## Frontend and Backend Separation

**Vercel Frontend Deployment**
• Automatic builds from Git
• Global CDN distribution
• Serverless function support
• Environment variable management

**Railway Backend Deployment**
• Persistent SQLite database
• Container-based deployment
• Database file persistence`,
    order: 11
  },
  {
    id: 12,
    title: "Deployment Challenges",
    content: `# Technical Challenges Faced

## SQLite Database Hosting

**Initial Challenge**
• Vercel serverless limitations
• SQLite file persistence issues
• Database state management

**Solution Implementation**
• Railway platform selection
• Persistent file system support
• Cross-origin resource sharing configuration
• Environment-specific database paths`,
    order: 12
  },
  {
    id: 13,
    title: "Testing Implementation",
    content: `# Quality Assurance Approach

## Comprehensive Testing Strategy

**Unit Testing**
• Component functionality tests
• Utility function validation
• Markdown parser testing
• API endpoint verification

**Integration Testing**
• Database operation testing
• Cross-browser compatibility
• Mobile device responsiveness`,
    order: 13
  },
  {
    id: 14,
    title: "Component Library",
    content: `# Storybook Integration

## Design System Documentation

**Component Documentation**
• Isolated component development
• Visual component library
• Interactive component playground

**Development Benefits**
• Faster component iteration
• Better collaboration workflow
• Regression testing support
• Style guide maintenance`,
    order: 14
  },
  {
    id: 15,
    title: "Key Takeaways",
    content: `# Project Insights

## Lessons Learned

**Technical Insights**
• Next.js provides excellent developer experience
• Tailwind CSS significantly reduces CSS complexity
• Platform-specific deployment requires careful planning
• Component testing improves code reliability

**Architecture Decisions**
• Separation of frontend and backend proved beneficial
• SQLite works well for development and small applications
• Drag and drop enhances user experience significantly`,
    order: 15
  },
  {
    id: 16,
    title: "Project Completion",
    content: `# Delivered Solution

## Requirements Fulfilled

**Core Functionality**
• Full-stack presentation platform
• Markdown-powered slide content
• Complete CRUD operations
• Drag and drop slide reordering

**Technical Excellence**
• Clean, maintainable codebase
• Comprehensive testing coverage
• Professional deployment strategy`,
    order: 16
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Sync database (create tables)
    await sequelize.sync({ force: true }); // force: true will drop existing tables
    console.log('Database synchronized.');
    
    // Insert seed data
    console.log('Inserting seed data...');
    for (const slideData of slidesData) {
      await Slide.create(slideData);
      console.log(`✓ Created slide: ${slideData.title}`);
    }
    
    console.log('\n🎉 Database seeded successfully!');
    console.log(`${slidesData.length} slides created`);
    
    // Verify data
    const count = await Slide.count();
    console.log(`Total slides in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedDatabase();