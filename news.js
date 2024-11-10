const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC'; // Replace with your API key
const BIN_ID = '67306866e41b4d34e451a945'; // Replace with your bin ID

document.getElementById('imageUrl').addEventListener('input', function() {
    const previewImage = document.getElementById('previewImage');
    if (this.value) {
        previewImage.src = this.value;
        previewImage.style.display = 'block';
    } else {
        previewImage.style.display = 'none';
    }
});

// Show loading state
function showLoading() {
    const form = document.getElementById('newsForm');
    form.classList.add('loading');
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    const form = document.getElementById('newsForm');
    form.classList.remove('loading');
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = false;
}

document.getElementById('newsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoading();
    
    const imageUrl = document.getElementById('imageUrl').value;
    const message = document.getElementById('message').value;
    const postStatus = document.getElementById('postStatus').checked ? 1 : 0;
    const imageStatus = document.getElementById('imageStatus').checked ? 1 : 0;
    const messageStatus = document.getElementById('messageStatus').checked ? 1 : 0;
    
    const data = {
        news: [{
            post_status: postStatus,
            image_url: imageUrl,
            image_status: imageStatus,
            message: message,
            message_status: messageStatus
        }]
    };
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            }, 2000);
        } else {
            alert('Error saving changes');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving changes');
    } finally {
        hideLoading();
    }
});

// Load existing data when page loads
async function loadExistingData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record.news && data.record.news.length > 0) {
                const news = data.record.news[0];
                document.getElementById('postStatus').checked = news.post_status === 1;
                document.getElementById('imageUrl').value = news.image_url;
                document.getElementById('imageStatus').checked = news.image_status === 1;
                document.getElementById('message').value = news.message;
                document.getElementById('messageStatus').checked = news.message_status === 1;
                
                if (news.image_url) {
                    document.getElementById('previewImage').src = news.image_url;
                    document.getElementById('previewImage').style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

window.onload = loadExistingData;
