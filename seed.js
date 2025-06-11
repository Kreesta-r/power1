const { sequelize, Slide } = require('./models');

const slidesData = [
  {
    id: 1,
    title: "Welcome",
    content: `# Welcome to Our Presentation

## Modern Web Development Platform

**Built with cutting-edge technology**

• Next.js 14 Framework
• TypeScript Integration  
• Tailwind CSS Styling
• Responsive Design

*Professional presentations made simple*`,
    order: 1
  },
  {
    id: 2,
    title: "Key Features",
    content: `# Key Features

## What Sets Us Apart

**🎯 Core Capabilities**
• Responsive across all devices
• Intuitive keyboard navigation
• Smart sidebar controls
• Real-time progress tracking`,
    order: 2
  },
  {
    id: 3,
    title: "Rich Content",
    content: `# Rich Content Support

## Professional Formatting

**Text Styling Options**
• **Bold emphasis** for key points
• *Italic text* for subtle emphasis
• Clean bullet organization`,
    order: 3
  },
  {
    id: 4,
    title: "Navigation",
    content: `# Seamless Navigation

## Multiple Control Methods

**⌨️ Keyboard Controls**
• Arrow keys (← →) for navigation
• Spacebar for advancing slides
• ESC for presentation overview`,
    order: 4
  },
  {
    id: 5,
    title: "Customization",
    content: `# Flexible Customization

## Tailored to Your Needs

**🎨 Design System**
• Professional color schemes
• Responsive layouts
• Smooth animations
• Brand consistency`,
    order: 5
  },
  {
    id: 6,
    title: "Get Started",
    content: `# Ready to Begin?

## Your Next Steps

**🚀 Quick Setup Process**

1. **Clone** the repository
2. **Install** dependencies
3. **Customize** your content
4. **Present** with confidence`,
    order: 6
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
    console.log(`📊 ${slidesData.length} slides created`);
    
    // Verify data
    const count = await Slide.count();
    console.log(`📈 Total slides in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedDatabase();