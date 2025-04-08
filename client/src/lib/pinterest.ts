// Pinterest API連携用サービス

// 注意: これはダミー実装です。実際の実装ではPinterest APIのアクセストークンなどが必要です。

// 環境変数から設定を読み込む（実際のプロジェクトではこれらの値を設定する必要があります）
const PINTEREST_APP_ID = import.meta.env.VITE_PINTEREST_APP_ID || 'dummy_app_id';
const PINTEREST_APP_SECRET = import.meta.env.VITE_PINTEREST_APP_SECRET || 'dummy_app_secret';
const REDIRECT_URI = `${window.location.origin}/auth/pinterest/callback`;

// Pinterest認証URLを生成する関数
export function getPinterestAuthUrl(): string {
  const scope = 'boards:read,boards:write,pins:read,pins:write';
  
  // 認証URLを作成
  return `https://www.pinterest.com/oauth/?client_id=${PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
}

// アクセストークンを取得する関数（実際の実装では、バックエンドAPIを呼び出します）
export async function getAccessToken(authCode: string): Promise<string> {
  try {
    // 実際の実装では、セキュリティ上の理由からトークン交換はバックエンドで行う必要があります
    console.log('認証コードからアクセストークンを取得します:', authCode);
    
    // NOTE: 通常はバックエンドAPIを呼び出す
    // const response = await fetch('/api/pinterest/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code: authCode })
    // });
    // const data = await response.json();
    // return data.access_token;
    
    // ダミー実装: 認証コードをそのまま返す（実際の実装では使用しないでください）
    return `dummy_access_token_${authCode}`;
  } catch (error) {
    console.error('アクセストークンの取得に失敗しました:', error);
    throw new Error('アクセストークンの取得に失敗しました');
  }
}

// Pinterestのボード情報を取得する関数
export async function getUserBoards(accessToken: string): Promise<PinterestBoard[]> {
  try {
    // 実際の実装ではPinterest APIを呼び出す
    console.log('ユーザーのボード情報を取得します');
    
    // ダミーデータを返す
    return [
      { id: 'board1', name: 'ライフビジョンボード', description: 'マイライフビジョン', image_url: 'https://via.placeholder.com/150' },
      { id: 'board2', name: '仕事の目標', description: 'キャリア目標のコレクション', image_url: 'https://via.placeholder.com/150' },
      { id: 'board3', name: '趣味とパッション', description: '好きなことを集めたボード', image_url: 'https://via.placeholder.com/150' },
    ];
  } catch (error) {
    console.error('ボード情報の取得に失敗しました:', error);
    throw new Error('ボード情報の取得に失敗しました');
  }
}

// 新しいボードを作成する関数
export async function createBoard(accessToken: string, name: string, description?: string): Promise<PinterestBoard> {
  try {
    console.log('新しいボードを作成します:', name, description);
    
    // ダミー実装: 新しいボードオブジェクトを返す
    return {
      id: `board_${Date.now()}`,
      name,
      description: description || '',
      image_url: 'https://via.placeholder.com/150'
    };
  } catch (error) {
    console.error('ボードの作成に失敗しました:', error);
    throw new Error('ボードの作成に失敗しました');
  }
}

// ボードにピンを追加する関数
export async function createPin(
  accessToken: string, 
  boardId: string, 
  imageUrl: string, 
  title: string, 
  description?: string
): Promise<PinterestPin> {
  try {
    console.log('ピンを作成します:', boardId, title);
    
    // ダミー実装: 新しいピンオブジェクトを返す
    return {
      id: `pin_${Date.now()}`,
      board_id: boardId,
      title,
      description: description || '',
      image_url: imageUrl,
      link: '',
    };
  } catch (error) {
    console.error('ピンの作成に失敗しました:', error);
    throw new Error('ピンの作成に失敗しました');
  }
}

// ビジョン結果をPinterestボードに変換する関数
export async function createVisionBoard(
  accessToken: string,
  visionResults: any[],
  boardName: string = 'マイライフビジョン'
): Promise<PinterestBoard> {
  try {
    // 1. 新しいボードを作成
    const board = await createBoard(accessToken, boardName, 'AIが生成したライフビジョン');
    
    // 2. 各ビジョン結果をピンとして追加
    for (const vision of visionResults) {
      // 実際の実装では、ビジョン結果から画像を生成するか、
      // デフォルト画像を使用することになるでしょう
      const imageUrl = 'https://via.placeholder.com/500/ffffff/000000?text=' + encodeURIComponent(vision.title);
      
      await createPin(
        accessToken,
        board.id,
        imageUrl,
        vision.title,
        vision.content
      );
    }
    
    return board;
  } catch (error) {
    console.error('ビジョンボードの作成に失敗しました:', error);
    throw new Error('ビジョンボードの作成に失敗しました');
  }
}

// 型定義
export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export interface PinterestPin {
  id: string;
  board_id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
}