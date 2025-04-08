type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'email';

// VisionResultの型定義
interface VisionResult {
  category: string;
  title: string;
  color: string;
  content: string;
}

/**
 * ビジョン共有用のテキストを生成
 */
export function generateShareText(keyMessage: string, visions: VisionResult[]): string {
  let text = `${keyMessage}\n\n`;
  
  visions.forEach(vision => {
    text += `✦ ${vision.title}: ${vision.content}\n`;
  });
  
  text += "\n#LifeVision #人生ビジョン";
  
  return text;
}

/**
 * 各種SNSプラットフォームでビジョンを共有
 */
export function shareVision(platform: SharePlatform, keyMessage: string, visions: VisionResult[]): void {
  const shareText = encodeURIComponent(generateShareText(keyMessage, visions));
  const appTitle = encodeURIComponent("LifeVision - 自分の人生のビジョンを描く");
  
  let shareUrl = "";
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${shareText}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${appTitle}&summary=${shareText}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${appTitle}&body=${shareText}`;
      break;
  }
  
  // 新しいウィンドウでシェアURLを開く
  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
}

/**
 * テキストをクリップボードにコピー
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(err => {
          console.error('Could not copy text: ', err);
          reject(err);
        });
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        console.error('Could not copy text: ', err);
        reject(err);
      }
    }
  });
}