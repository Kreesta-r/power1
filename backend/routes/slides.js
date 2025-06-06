const express = require('express');
const { Slide } = require('../models');
const router = express.Router();

// GET /api/slides - Get all slides (ordered by 'order' field)
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['id', 'ASC']],
      attributes: ['id', 'title', 'content', 'order']
    });
    
    res.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// GET /api/slides/:id - Get a specific slide
router.get('/:id', async (req, res) => {
  try {
    const slide = await Slide.findByPk(req.params.id, {
      attributes: ['id', 'title', 'content', 'order']
    });
    
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    if (!slide.isActive) {
      return res.status(404).json({ error: 'Slide not available' });
    }
    
    res.json(slide);
  } catch (error) {
    console.error('Error fetching slide:', error);
    res.status(500).json({ error: 'Failed to fetch slide' });
  }
});

// POST /api/slides - Create a new slide
router.post('/', async (req, res) => {
  try {
    const { title, content, order } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }
    
    const slide = await Slide.create({
      title: title.trim(),
      content: content.trim(),
      order: order || 0
    });
    
    res.status(201).json({
      id: slide.id,
      title: slide.title,
      content: slide.content,
      order: slide.order
    });
  } catch (error) {
    console.error('Error creating slide:', error);
    res.status(500).json({ error: 'Failed to create slide' });
  }
});

// PUT /api/slides/:id - Update a slide
router.put('/:id', async (req, res) => {
  try {
    const { title, content, order } = req.body;
    
    const slide = await Slide.findByPk(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    // Update fields if provided
    if (title !== undefined) slide.title = title.trim();
    if (content !== undefined) slide.content = content.trim();
    if (order !== undefined) slide.order = order;
    
    await slide.save();
    
    res.json({
      id: slide.id,
      title: slide.title,
      content: slide.content,
      order: slide.order
    });
  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

// DELETE /api/slides/:id - Soft delete a slide
router.delete('/:id', async (req, res) => {
  try {
    const slide = await Slide.findByPk(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    // Soft delete by setting isActive to false
    slide.isActive = false;
    await slide.save();
    
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

// PUT /api/slides/:id/reorder - Update slide order
router.put('/:id/reorder', async (req, res) => {
  try {
    const { newOrder } = req.body;
    
    if (typeof newOrder !== 'number') {
      return res.status(400).json({ error: 'newOrder must be a number' });
    }
    
    const slide = await Slide.findByPk(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    slide.order = newOrder;
    await slide.save();
    
    res.json({
      id: slide.id,
      title: slide.title,
      order: slide.order
    });
  } catch (error) {
    console.error('Error reordering slide:', error);
    res.status(500).json({ error: 'Failed to reorder slide' });
  }
});

module.exports = router;