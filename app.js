function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function drawPlayerCard() {
    const canvas = document.getElementById('playerCard');
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#212121');
    gradient.addColorStop(1, '#424242');
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, 0, 0, 800, 250, 20);

    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#808080';
    ctx.stroke();

    // Draw the profile icon with a golden border
    const profileIcon = new Image();
    profileIcon.src = 'https://ddragon.leagueoflegends.com/cdn/11.20.1/img/profileicon/685.png';
    profileIcon.onload = () => {
        // Golden Circle Frame for profile icon
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Draw the profile icon inside the circle
        ctx.drawImage(profileIcon, 25, 25, 180, 180);

        ctx.lineWidth = 8;
        ctx.strokeStyle = '#FFD700';
        ctx.stroke();
        ctx.restore();

        // Draw Player Name and Rank
        ctx.fillStyle = '#ffffff';
        ctx.font = '40px "Montserrat", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Rinkutemo#Prime', 250, 100);

        // Draw Rank and Challenge Points
        ctx.fillStyle = '#FFD700';
        ctx.font = '24px "Montserrat", sans-serif';
        ctx.fillText('Rank: GRANDMASTER (#15)', 250, 150);
        ctx.fillStyle = '#D0E7FF';
        ctx.font = '22px "Montserrat", sans-serif';
        ctx.fillText('Challenge Points: 27235', 250, 185);
    };
}

drawPlayerCard();
