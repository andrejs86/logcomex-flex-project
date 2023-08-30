/* eslint-disable radix */

export const timer = (duration, display) => {
  let timer = duration;
  return setInterval(() => {
    let hours = parseInt(timer / 3600);
    let minutes = parseInt((timer - hours * 3600) / 60);
    let seconds = parseInt(timer % 60);
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    if (display) {
      const totaltime_text = hours === '00' ? `${minutes}min ${seconds}s ` : `${hours}h ${minutes}min ${seconds}s`;
      display.textContent = `Tempo total: ${totaltime_text}`;
    }
    // eslint-disable-next-line no-plusplus
    if (++timer < 0) {
      timer = duration;
    }
  }, 1000);
};
