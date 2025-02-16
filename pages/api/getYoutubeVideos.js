// pages/api/getYoutubeVideos.js
import axios from 'axios';

export default async function handler(req, res) {
    const ApiKey = process.env.YOUTUBE_API_KEY;  // Store your API key in .env.local
    const ChannelID = 'UCH6ADxBFyVUsiazyICRz2sQ'; // Set your ChannelID here

    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                key: ApiKey,
                channelId: ChannelID,
                part: 'snippet,id',
                order: 'date',
            }
        });
        res.status(200).json(response.data);  // Return the YouTube data as JSON response
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Unable to fetch YouTube videos.' });  // Send error response
    }
}
