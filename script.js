// Shared text for the Moon phase interaction.
const theMoonPhaseDescriptions = {
  newMoon: 'We can barely see it because its sunlit side faces away from Earth.',
  firstQuarter: 'We can see half of the Moon’s Earth-facing side.',
  fullMoon: 'The side facing Earth is fully lit by the Sun.'
};

document.addEventListener('DOMContentLoaded', () => {
  // Mark the current page in the shared navigation.
  const navigationLinks = [...document.querySelectorAll('.nav-links a')];
  let currentPage = '';
  navigationLinks.forEach((link) => {
    const pagePath = new URL(link.href).pathname;
    if (pagePath === window.location.pathname) {
      link.setAttribute('aria-current', 'page');
      currentPage = pagePath.split('/').pop();
    }
  });

  const missionDialog = document.querySelector('#mission-dialog');
  if (currentPage) {
    const missionKey = 'solarSystemVisitedPages';
    const visitedPages = new Set();
    let progressAvailable = true;

    try {
      (sessionStorage.getItem(missionKey) || '').split('|').filter(Boolean).forEach((page) => {
        visitedPages.add(page);
      });
      visitedPages.add(currentPage);
      sessionStorage.setItem(missionKey, [...visitedPages].join('|'));
    } catch {
      progressAvailable = false;
      visitedPages.add(currentPage);
    }

    if (missionDialog) {
      const missionItems = [...missionDialog.querySelectorAll('[data-mission-page]')];
      const progress = missionDialog.querySelector('#mission-progress');
      const storageNote = missionDialog.querySelector('#mission-storage-note');

      const updateMissionList = () => {
        let completedCount = 0;
        missionItems.forEach((item) => {
          const isComplete = visitedPages.has(item.dataset.missionPage);
          const status = item.querySelector('span');
          item.classList.toggle('is-complete', isComplete);
          status.textContent = isComplete ? 'Explored' : 'Not yet';
          status.setAttribute('aria-label', isComplete ? 'Explored' : 'Not yet explored');
          if (isComplete) completedCount += 1;
        });
        progress.textContent = `${completedCount} of ${missionItems.length} places explored.`;
        storageNote.hidden = progressAvailable;
      };

      document.querySelector('#mission-log-open').addEventListener('click', () => {
        updateMissionList();
        missionDialog.showModal();
      });
      document.querySelector('#mission-log-close').addEventListener('click', () => {
        missionDialog.close();
      });
      missionDialog.addEventListener('click', (event) => {
        if (event.target === missionDialog) missionDialog.close();
      });
    }
  }

  const calculators = document.querySelectorAll('[data-gravity]');

  calculators.forEach((calculator) => {
    const gravity = Number(calculator.dataset.gravity);
    const planetName = calculator.dataset.planet;
    const input = calculator.querySelector('input[type="number"]');
    const button = calculator.querySelector('button');
    const output = calculator.querySelector('.result-box');
    output.setAttribute('role', 'status');
    output.setAttribute('aria-live', 'polite');

    button.addEventListener('click', () => {
      const earthWeight = Number(input.value);
      if (!Number.isFinite(earthWeight) || earthWeight <= 0) {
        output.textContent = 'Enter a number above 0 to calculate your weight.';
        return;
      }

      const weightOnPlanet = (earthWeight * gravity).toFixed(1);
      output.textContent = `Your weight on ${planetName} would be ${weightOnPlanet} lbs.`;
    });
  });

  const orbitToggle = document.querySelector('#orbit-toggle');
  if (orbitToggle) {
    const orbit = document.querySelector('.orbit');
    const status = document.querySelector('#orbit-status');
    orbitToggle.addEventListener('click', () => {
      const isAnimating = orbit.classList.toggle('is-animating');
      orbitToggle.setAttribute('aria-pressed', String(isAnimating));
      orbitToggle.textContent = isAnimating ? 'Stop the orbits' : 'Start the orbits';
      status.textContent = isAnimating
        ? 'The planets are moving around the Sun.'
        : 'Press the button to see the planets move.';
    });
  }

  // Each page opts into its interaction with a data-feature value.
  document.querySelectorAll('[data-feature]').forEach((feature) => {
    switch (feature.dataset.feature) {
      case 'sun': {
        const button = feature.querySelector('#sun-flare-button');
        const status = feature.querySelector('#sun-feature-status');
        const image = document.querySelector('.planet-visual img');
        button.addEventListener('click', () => {
          const flareActive = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(flareActive));
          image.classList.toggle('sun-flaring', flareActive);
          button.textContent = flareActive ? 'Stop illustration' : 'Show flare illustration';
          status.textContent = flareActive
            ? 'This glow is a visual illustration, not a live solar flare or live space-weather alert.'
            : 'Solar flares are eruptions of energy from the Sun. Press the button for a visual illustration, not live data.';
        });
        break;
      }
      case 'moon': {
        const status = feature.querySelector('#moon-phase-status');
        feature.querySelectorAll('[data-phase]').forEach((button) => {
          button.addEventListener('click', () => {
            const phase = button.dataset.phase;
            feature.querySelectorAll('[data-phase]').forEach((phaseButton) => {
              phaseButton.setAttribute('aria-pressed', String(phaseButton === button));
            });
            document.querySelector('.moon-illustration').dataset.phase = phase.toLowerCase().replace(' ', '-');
            status.textContent = `${phase}. ${phase === 'New Moon'
              ? theMoonPhaseDescriptions.newMoon
              : phase === 'Full Moon'
                ? theMoonPhaseDescriptions.fullMoon
                : theMoonPhaseDescriptions.firstQuarter}`;
          });
        });
        break;
      }
      case 'earth': {
        const button = feature.querySelector('#earth-day-button');
        const status = feature.querySelector('#earth-feature-status');
        const image = document.querySelector('.planet-visual img');
        button.addEventListener('click', () => {
          const nightSide = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(nightSide));
          image.classList.toggle('night-side', nightSide);
          button.textContent = nightSide ? "Show Earth's day side" : "Show Earth's night side";
          status.textContent = nightSide
            ? 'This simple darkening effect represents the night side; it is not a live day-night map.'
            : 'This simple bright view represents the day side; it is not a live day-night map.';
        });
        break;
      }
      case 'mercury': {
        const slider = feature.querySelector('#mercury-temperature');
        const value = feature.querySelector('#mercury-temperature-value');
        const status = feature.querySelector('#mercury-temperature-status');
        slider.addEventListener('input', () => {
          const temperature = Number(slider.value);
          value.textContent = `${temperature}°C`;
          status.textContent = temperature < 0
            ? `At ${temperature}°C, Mercury's dark surface is very cold.`
            : temperature > 300
            ? `At ${temperature}°C, Mercury's sunlit surface is very hot.`
            : `At ${temperature}°C, sunlight is warming Mercury's surface.`;
        });
        break;
      }
      case 'venus': {
        const button = feature.querySelector('#venus-cloud-button');
        const fact = feature.querySelector('#venus-surface-fact');
        const status = feature.querySelector('#venus-feature-status');
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') !== 'true';
          button.setAttribute('aria-expanded', String(isExpanded));
          fact.hidden = !isExpanded;
          button.textContent = isExpanded ? 'Hide the surface fact' : 'Reveal a surface fact';
          status.textContent = isExpanded
            ? 'Here is a fact about the surface beneath Venus’s clouds.'
            : 'Venus’s thick clouds hide its rocky surface.';
        });
        break;
      }
      case 'mars': {
        const status = feature.querySelector('#mars-route-status');
        const features = {
          crater: 'Impact craters expose layers of rock that help scientists study Mars’s history.',
          volcano: 'Olympus Mons is a giant shield volcano and the tallest known volcano in the solar system.',
          ice: 'Mars’s polar caps contain water ice; seasonal carbon dioxide frost also forms there.'
        };
        feature.querySelectorAll('[data-route]').forEach((button) => {
          button.addEventListener('click', () => {
            feature.querySelectorAll('[data-route]').forEach((routeButton) => {
              routeButton.setAttribute('aria-pressed', String(routeButton === button));
            });
            status.textContent = features[button.dataset.route];
          });
        });
        break;
      }
      case 'jupiter': {
        const button = feature.querySelector('#jupiter-storm-button');
        const image = document.querySelector('.planet-visual img');
        const status = feature.querySelector('#jupiter-feature-status');
        button.addEventListener('click', () => {
          const isAnimating = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(isAnimating));
          image.classList.toggle('jupiter-rotation-demo', isAnimating);
          button.textContent = isAnimating ? 'Stop illustration' : 'Illustrate Jupiter’s rotation';
          status.textContent = isAnimating
            ? 'This slow spin is an illustration, not real-time footage. Jupiter rotates once in about 9.9 hours, and its Great Red Spot is a long-lived storm.'
            : 'Jupiter’s Great Red Spot is a long-lived storm. Start the button for a simple, non-time-scaled rotation illustration.';
        });
        break;
      }
      case 'saturn': {
        const status = feature.querySelector('#saturn-ring-status');
        const descriptions = {
          materials: 'Saturn’s rings are made mostly of water ice, with rocky material and dust mixed in.',
          division: 'The Cassini Division is a broad gap between Saturn’s A and B rings, shaped largely by gravitational interactions with moons.',
          thickness: 'Saturn’s rings are extremely wide but very thin compared with their width.'
        };
        feature.querySelectorAll('[data-ring-view]').forEach((button) => {
          button.addEventListener('click', () => {
            feature.querySelectorAll('[data-ring-view]').forEach((viewButton) => {
              viewButton.setAttribute('aria-pressed', String(viewButton === button));
            });
            status.textContent = descriptions[button.dataset.ringView];
          });
        });
        break;
      }
      case 'uranus': {
        const status = feature.querySelector('#uranus-season-status');
        const descriptions = {
          summer: 'One pole can face the Sun for about 21 Earth years.',
          equinox: 'Sunlight reaches Uranus’s equator during this part of its orbit.',
          winter: 'One pole can spend decades turned away from the Sun.'
        };
        feature.querySelectorAll('[data-season]').forEach((button) => {
          button.addEventListener('click', () => {
            feature.querySelectorAll('[data-season]').forEach((seasonButton) => {
              seasonButton.setAttribute('aria-pressed', String(seasonButton === button));
            });
            status.textContent = descriptions[button.dataset.season];
          });
        });
        break;
      }
      case 'neptune': {
        const button = feature.querySelector('#neptune-rotation-button');
        const image = document.querySelector('.planet-visual img');
        const status = feature.querySelector('#neptune-feature-status');
        button.addEventListener('click', () => {
          const isRotating = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(isRotating));
          image.classList.toggle('rotating', isRotating);
          button.textContent = isRotating ? 'Stop illustration' : 'Illustrate Neptune’s rotation';
          status.textContent = isRotating
            ? 'This animation is an illustration, not time-scaled. Neptune rotates once in about 16 hours.'
            : 'Neptune rotates once in about 16 hours. Start the button for a simple, non-time-scaled illustration.';
        });
        break;
      }
    }
  });
});