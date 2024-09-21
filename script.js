// Array of profile pictures and associated themes
const profiles = [
  {
    image: 'images/profile1.jpg',
    theme: {
      primary: '#0a192f',
      secondary: '#112240',
      accent: '#64ffda',
      text: '#ccd6f6',
    }
  },
  {
    image: 'images/profile2.jpg',
    theme: {
      primary: '#1f1f1f',
      secondary: '#2e2e2e',
      accent: '#e94560',
      text: '#f5f5f5',
    }
  },
  // Add more profiles if desired
];

// Function to get the profile based on the day
function getProfileOfTheDay() {
  const today = new Date();
  const index = today.getDate() % profiles.length;
  return profiles[index];
}

// Apply the profile picture and theme
function applyProfile() {
  const profile = getProfileOfTheDay();

  // Update profile picture
  const profilePicture = document.getElementById('profile-picture');
  profilePicture.src = profile.image;

  // Update CSS variables for theme colors
  document.documentElement.style.setProperty('--primary-color', profile.theme.primary);
  document.documentElement.style.setProperty('--secondary-color', profile.theme.secondary);
  document.documentElement.style.setProperty('--accent-color', profile.theme.accent);
  document.documentElement.style.setProperty('--text-color', profile.theme.text);
}

// Toggle Contact Modal
function toggleModal() {
  const modal = document.getElementById('contact-modal');
  modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

// Close Modal when clicking outside content
window.onclick = function(event) {
  const modal = document.getElementById('contact-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Initialize functions when the page loads
window.onload = function() {
  applyProfile();

  // Add event listener to the Hire Me button
  const hireMeBtn = document.getElementById('hire-me-btn');
  hireMeBtn.addEventListener('click', toggleModal);

  // Close button in the modal
  const closeBtn = document.querySelector('.close-btn');
  closeBtn.addEventListener('click', toggleModal);
};
