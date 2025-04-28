const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(express.json());

async function getLatestDragonVersion() {
    try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        return response.data[0]; // Latest version
    } catch (err) {
        console.error("Failed to fetch Data Dragon version:", err.message);
        throw new Error("Could not retrieve Data Dragon version");
    }
}

async function generatePlayerCardImage(gameName, tagLine, challengePoints, profileIconUrl, rankLevel, rankPosition) {
    const canvas = createCanvas(800, 250);
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#212121');
    gradient.addColorStop(1, '#424242');
    ctx.fillStyle = gradient;

    // Shadow Settings
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Draw Rounded Rectangle
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(780, 0);
    ctx.quadraticCurveTo(800, 0, 800, 20);
    ctx.lineTo(800, 230);
    ctx.quadraticCurveTo(800, 250, 780, 250);
    ctx.lineTo(20, 250);
    ctx.quadraticCurveTo(0, 250, 0, 230);
    ctx.lineTo(0, 20);
    ctx.quadraticCurveTo(0, 0, 20, 0);
    ctx.closePath();
    ctx.fill();
    // Shadow for the card border
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#808080';
    ctx.stroke();

    // Profile Icon
    let profileIcon;
    try {
        profileIcon = await loadImage(profileIconUrl);
    } catch (err) {
        console.error('Failed to load profile icon:', err.message);
        throw new Error('Profile icon could not be loaded');
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 90, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profileIcon, 35, 35, 180, 180);
    ctx.restore();

    // Golden Circle Frame
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(125, 125, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Player Name
    const profileName = `${gameName || 'Unknown'}#${tagLine || '0000'}`;
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(profileName, 250, 100);

    // Rank
    ctx.fillStyle = '#FFD700';
    ctx.font = '28px Arial';
    ctx.fillText(`Rank: ${rankLevel || '?' } (#${rankPosition || '?'})`, 250, 150);

    // Challenge Points
    ctx.fillStyle = '#D0E7FF';
    ctx.font = '22px Arial';
    ctx.fillText(`Challenge Points: ${challengePoints ?? 0}`, 250, 185);

    return canvas.toBuffer('image/png');
}

app.post('/api/generate-player-card', async (req, res) => {
    const { gameName, tagLine, channelId } = req.body;
    console.log('Received body:', req.body);

    if (!gameName || !tagLine || !channelId) {
        return res.status(400).json({ error: 'gameName, tagLine, and channelId are required' });
    }

    try {
        const RIOT_API_KEY = process.env.RIOT_API_KEY;
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const DDRAGON_VERSION = await getLatestDragonVersion();
        const RIOT_REGION = 'europe';
        const SUMMONER_REGION = 'eun1';

        const accountResponse = await axios.get(`https://${RIOT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        const account = accountResponse.data;

        const summonerResponse = await axios.get(`https://${SUMMONER_REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        const summoner = summonerResponse.data;

        const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${summoner.profileIconId}.png`;

        const challengeResponse = await axios.get(`https://${SUMMONER_REGION}.api.riotgames.com/lol/challenges/v1/player-data/${summoner.puuid}`, {
            headers: { 'X-Riot-Token': RIOT_API_KEY }
        });
        const totalPoints = challengeResponse.data.totalPoints;
        const challengePoints = totalPoints.current;
        const rankLevel = totalPoints.level;
        const rankPosition = totalPoints.position;

        const buffer = await generatePlayerCardImage(gameName, tagLine, challengePoints, profileIconUrl, rankLevel, rankPosition);

        const form = new FormData();
        form.append('file', buffer, { filename: 'playercard.png', contentType: 'image/png' });

        await axios.post(`https://discord.com/api/v10/channels/${channelId}/messages`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bot ${BOT_TOKEN}`
            }
        });

        res.json({ message: 'Player card generated and sent to Discord!' });
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate player card', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
