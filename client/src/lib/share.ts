import { VisionResult } from './types';

type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'email';

export function generateShareText(keyMessage: string, visions: VisionResult[]): string {
  const visionTitles = visions.map(v => v.title).join(', ');
  return `My Life Vision: ${keyMessage}\n\nKey areas: ${visionTitles}\n\nGenerated with Life Vision App`;
}

export function shareVision(platform: SharePlatform, keyMessage: string, visions: VisionResult[]): void {
  const shareText = encodeURIComponent(generateShareText(keyMessage, visions));
  const url = encodeURIComponent(window.location.href);
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${url}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=My Life Vision&body=${shareText}%0A%0A${url}`;
      break;
    default:
      return;
  }
  
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        resolve(true);
      } catch (err) {
        resolve(false);
      }
    }
  });
}
