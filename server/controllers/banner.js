import BannerSlide from '../models/Banner.js';

/**
 * Get all banner slides
 */
export const getBannerSlides = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const slides = await BannerSlide.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ slides });
  } catch (error) {
    console.error('Error fetching banner slides:', error);
    res.status(500).json({ message: 'Failed to fetch banner slides', error: error.message });
  }
};

/**
 * Get a single banner slide by ID
 */
export const getBannerSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await BannerSlide.findOne({ id });
    
    if (!slide) {
      return res.status(404).json({ message: 'Banner slide not found' });
    }
    
    res.status(200).json({ slide });
  } catch (error) {
    console.error('Error fetching banner slide:', error);
    res.status(500).json({ message: 'Failed to fetch banner slide', error: error.message });
  }
};

/**
 * Create a new banner slide
 */
export const createBannerSlide = async (req, res) => {
  try {
    const slideData = req.body;
    
    // Check if slide with same id exists
    const existingSlide = await BannerSlide.findOne({ id: slideData.id });
    if (existingSlide) {
      return res.status(400).json({ message: 'Banner slide with this ID already exists' });
    }
    
    const slide = new BannerSlide(slideData);
    await slide.save();
    
    res.status(201).json({ message: 'Banner slide created successfully', slide });
  } catch (error) {
    console.error('Error creating banner slide:', error);
    res.status(500).json({ message: 'Failed to create banner slide', error: error.message });
  }
};

/**
 * Update a banner slide
 */
export const updateBannerSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const slide = await BannerSlide.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!slide) {
      return res.status(404).json({ message: 'Banner slide not found' });
    }
    
    res.status(200).json({ message: 'Banner slide updated successfully', slide });
  } catch (error) {
    console.error('Error updating banner slide:', error);
    res.status(500).json({ message: 'Failed to update banner slide', error: error.message });
  }
};

/**
 * Delete a banner slide
 */
export const deleteBannerSlide = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slide = await BannerSlide.findOneAndDelete({ id });
    
    if (!slide) {
      return res.status(404).json({ message: 'Banner slide not found' });
    }
    
    res.status(200).json({ message: 'Banner slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner slide:', error);
    res.status(500).json({ message: 'Failed to delete banner slide', error: error.message });
  }
};

/**
 * Reorder banner slides
 */
export const reorderBannerSlides = async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, order }
    
    if (!Array.isArray(slides)) {
      return res.status(400).json({ message: 'Slides must be an array' });
    }
    
    const updatePromises = slides.map(({ id, order }) =>
      BannerSlide.findOneAndUpdate({ id }, { $set: { order } }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ message: 'Banner slides reordered successfully' });
  } catch (error) {
    console.error('Error reordering banner slides:', error);
    res.status(500).json({ message: 'Failed to reorder banner slides', error: error.message });
  }
};
