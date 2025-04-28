// const express = require('express');
// const app = express();
// const port = 3000;
// require('dotenv').config();
// const axios = require('axios');
// const { createClient } = require('@supabase/supabase-js');
// const { createCanvas, loadImage } = require('canvas');
// const FormData = require('form-data');
//
// // Middleware to parse JSON
// app.use(express.json());
//
// // Supabase setup
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);
//
// // Register a new player
// app.post('/register', async (req, res) => {
//     const { nickname } = req.body;
//     if (!nickname) {
//         return res.status(400).json({ error: 'Nickname is required' });
//     }
//
//     const { data: existingPlayer, error: selectError } = await supabase
//         .from('players')
//         .select('*')
//         .eq('nickname', nickname)
//         .single();
//
//     if (selectError && selectError.code !== 'PGRST116') {
//         return res.status(500).json({ error: 'Database error', details: selectError });
//     }
//
//     if (existingPlayer) {
//         return res.json({ message: `${nickname} is already registered` });
//     }
//
//     const { error: insertError } = await supabase
//         .from('players')
//         .insert([{ nickname: nickname, games_played: 0 }]);
//
//     if (insertError) {
//         return res.status(500).json({ error: 'Failed to register player', details: insertError });
//     }
//
//     res.json({ message: `Registered ${nickname}` });
// });
//
// // Update games played
// app.post('/update-games', async (req, res) => {
//     const { nickname } = req.body;
//     if (!nickname) {
//         return res.status(400).json({ error: 'Nickname is required' });
//     }
//
//     const { data: player, error: selectError } = await supabase
//         .from('players')
//         .select('*')
//         .eq('nickname', nickname)
//         .single();
//
//     if (selectError || !player) {
//         return res.status(404).json({ error: 'Player not found' });
//     }
//
//     const updatedGames = player.games_played + 1;
//
//     const { error: updateError } = await supabase
//         .from('players')
//         .update({ games_played: updatedGames })
//         .eq('nickname', nickname);
//
//     if (updateError) {
//         return res.status(500).json({ error: 'Failed to update player', details: updateError });
//     }
//
//     res.json({ message: `Games updated for ${nickname}`, gamesPlayed: updatedGames });
// });
//
// // Get stats
// app.get('/stats/:nickname', async (req, res) => {
//     const { nickname } = req.params;
//
//     const { data: player, error } = await supabase
//         .from('players')
//         .select('*')
//         .eq('nickname', nickname)
//         .single();
//
//     if (error || !player) {
//         return res.status(404).json({ error: 'Player not found' });
//     }
//
//     res.json(player);
// });
//
//
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
