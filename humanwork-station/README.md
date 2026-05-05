# HumanWork Station

AIエージェントを「使う」場所ではない。AIに「仕事を任せる」ための場所だ。

## セットアップ

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定:
- `NEXT_PUBLIC_SUPABASE_URL` — SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabaseの公開APIキー
- `OPENAI_API_KEY` — OpenAI APIキー

### 3. Supabaseのセットアップ

`supabase/migrations/001_initial_schema.sql` をSupabaseのSQL Editorで実行してテーブルを作成してください。

### 4. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 主な機能

### P0 ユーザーストーリー
- **US-001, US-003, US-004**: メール/パスワード認証、メール確認、ログイン/ログアウト
- **US-006**: 初回ログイン時のオンボーディング（ワークスペース作成）
- **US-010〜013**: エージェント一覧・作成（名前、説明、システムプロンプト）
- **US-015**: エージェントの編集・削除
- **US-018〜020**: エージェントの実行、データ入力、結果表示（ストリーミング）
- **US-021〜023**: 実行履歴一覧・詳細・エージェント改善
- **US-025**: エラー表示
- **US-030**: エージェントのシステムプロンプト確認（透明性）

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **バックエンド**: Next.js Route Handlers
- **DB / 認証**: Supabase (PostgreSQL + Supabase Auth)
- **AI**: Vercel AI SDK + OpenAI gpt-4o-mini
- **UI**: shadcn/ui + Tailwind CSS

## ディレクトリ構成

```
app/
  (auth)/         # 認証ページ (signup, login, callback)
  (app)/          # 認証済みアプリ
    onboarding/   # オンボーディング
    agents/       # エージェント一覧・作成・編集・実行
    history/      # 実行履歴
  api/
    scenarios/    # エージェントCRUD API
    runner/execute/ # エージェント実行API (streaming)
lib/supabase/     # Supabaseクライアント・型定義
components/       # UIコンポーネント
supabase/migrations/ # DBスキーマ
```
