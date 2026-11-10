
import Joi from 'joi';
import { Review } from '../models/Review.js';

// Validate review data before saving it
const reviewSchema = Joi.object({
  listing: Joi.string().hex().length(24).required(),
  rating: Joi.number().min(1).max(5).default(5),

  // Reviews can contain HTML formatting.
  // The client will sanitize it using DOMPurify
  // before rendering it in the browser.
  body: Joi.string().min(1).required(),

  // The author must come from the logged-in user.
  author: Joi.forbidden()
});

// GET /api/reviews?listing=<id>
// Public route: anyone can read reviews.
export async function getReviewsForListing(req, res, next) {
  try {
    const { listing } = req.query;

    // Validate listing ID
    if (!listing) {
      return res.status(400).json({
        message: 'listing query param is required'
      });
    }

    if (!/^[a-fA-F0-9]{24}$/.test(listing)) {
      return res.status(400).json({
        message: 'Invalid listing ID'
      });
    }

    const reviews = await Review.find({ listing })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
// Protected route: only logged-in users can post reviews.
export async function createReview(req, res, next) {
  try {
    const { value, error } = reviewSchema.validate(req.body);

    // Reject invalid review data
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    // The author is always the authenticated user.
    // Never trust an author ID submitted by the client.
    const doc = await Review.create({
      ...value,
      author: req.user.id
    });

    const review = await Review.findById(doc._id)
      .populate('author', 'name')
      .lean();

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}
