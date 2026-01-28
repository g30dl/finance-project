import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  } catch (error) {
    console.warn('Confetti not available', error);
  }
};
