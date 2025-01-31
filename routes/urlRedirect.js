const express = require('express');
const URLModel = require('../models/urls');
// const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for redirecting based on short URL
router.put('/url-redirect/:shortURL', async (req, res) => {
    const { shortURL } = req.params; // Get the short URL from route params

    const { timestamp, referringPage, deviceType, browser, os, location } = req.body;

    console.log(timestamp, referringPage, deviceType, browser, os, location)

    try {
        // Look for the short URL in the database
        const existingURL = await URLModel.findOneAndUpdate(
            { shortURL },
            {
                $inc: { clicks: 1 },
                $push: {
                    analytics: {
                        timestamp,
                        referringPage,
                        deviceType,
                        browser,
                        os,
                        location,
                    }
                }
            },
            { new: true }
        );

        // If URL is found, redirect to the long URL
        if (existingURL) {
            return res.status(200).json({
                longURL: existingURL.longURL
            });
        }

        // If the short URL is not found
        return res.status(404).json({
            message: 'Short URL not found',
        });

    } catch (error) {
        console.error('Error fetching URL:', error);

        // Return a 500 response for unexpected server errors
        res.status(500).json({
            message: 'Internal Server Error. Please try again later.',
        });
    }
});

module.exports = router;
