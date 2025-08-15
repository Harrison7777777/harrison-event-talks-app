document.addEventListener('DOMContentLoaded', () => {
  const scheduleContainer = document.getElementById('schedule');
  const combinedSearchInput = document.getElementById('combinedSearchInput');
  let talks = [];

  fetch('/api/talks')
    .then(response => response.json())
    .then(data => {
      talks = data;
      renderSchedule(talks);
    });

  function filterTalks() {
    const searchTerm = combinedSearchInput.value.toLowerCase();

    const filteredTalks = talks.filter(talk => {
      const categoryMatch = talk.category.some(cat => cat.toLowerCase().includes(searchTerm));
      const speakerMatch = talk.speakers.some(speaker => speaker.toLowerCase().includes(searchTerm));
      return categoryMatch || speakerMatch;
    });

    renderSchedule(filteredTalks);
  }

  combinedSearchInput.addEventListener('input', filterTalks);

  function renderSchedule(talksToRender) {
    scheduleContainer.innerHTML = '';
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0, 0);

    talksToRender.forEach((talk, index) => {
      if (index === 3) {
        // Lunch Break after the 3rd talk
        const lunchBreak = document.createElement('div');
        lunchBreak.classList.add('schedule-item');
        const lunchTime = new Date(currentTime.getTime() + 10 * 60000);
        lunchBreak.innerHTML = `
          <div class="time">${formatTime(lunchTime)} - ${formatTime(new Date(lunchTime.getTime() + 60 * 60000))}</div>
          <h2>Lunch Break</h2>
        `;
        scheduleContainer.appendChild(lunchBreak);
        currentTime.setTime(lunchTime.getTime() + 60 * 60000);
      }

      const talkElement = document.createElement('div');
      talkElement.classList.add('schedule-item');

      const startTime = new Date(currentTime.getTime());
      const endTime = new Date(startTime.getTime() + talk.duration * 60000);

      talkElement.innerHTML = `
        <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
        <h2>${talk.title}</h2>
        <div class="speakers">By: ${talk.speakers.join(', ')}</div>
        <p>${talk.description}</p>
        <div class="category">${talk.category.map(cat => `<span>${cat}</span>`).join('')}</div>
      `;

      scheduleContainer.appendChild(talkElement);

      currentTime.setTime(endTime.getTime() + 10 * 60000); // 10 minute break
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});
