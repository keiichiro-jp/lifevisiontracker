import '../styles/humanwork.css';

/* ===== MASTHEAD ===== */
function Masthead() {
  return (
    <header className="hw-masthead">
      <div className="hw-container">
        <div className="masthead-grid">
          <div className="mast-left">Vol. 01 · Discussion Paper</div>
          <div className="mast-center">HumanWork ⌬ Quarterly</div>
          <div className="mast-right">May 2026 · Internal Draft</div>
        </div>
        <div className="hw-hero">
          <div className="hero-tag">— Strategic Memorandum / For Founder Review —</div>
          <h1 className="hero-title">
            コンセプトの<em>抽象度</em>を、<br />
            一段だけ降りてみる。
          </h1>
          <div className="hero-meta">
            <span>Subject: <strong>HumanWork Station</strong></span>
            <span>Author: <strong>Strategy Desk</strong></span>
            <span>Pages: <strong>05</strong></span>
            <span>Status: <strong>For Discussion</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===== §00 MISSION ===== */
function MissionSection() {
  return (
    <section className="hw-section" id="mission">
      <div className="hw-container">
        <div className="section-num">§ 00 — Mission & Products</div>
        <div className="mission-statement">
          労働を、<em>創造</em>に。
        </div>
        <p className="mission-body">
          すべての人を、労働から解放する。AIとオートメーションによって「食うための労働」を不要にし、
          人々の時間と精神的余白を取り戻す。人間本来の創造・探求・冒険・つながりを中心にした社会を実現する。
          <br /><br />
          HumanWork Station は AIを"使う"場所ではない。AIに"仕事を任せる"ための場所だ。
        </p>

        <div className="bench-takeaway">
          <h4>★ Value Proposition</h4>
          <p>
            <strong>言語化不要で任せられる</strong> — プロンプトを書かなくてよい。エージェントが既に設計されている。<br />
            <strong>使い捨てにならない</strong> — エージェント・履歴・改善が資産化し、最適化されていく。<br />
            <strong>自分だけの業務OS</strong> — 一人社長が、30人の部下を持つ感覚。
          </p>
        </div>

        <div className="products-grid">
          <div className="product-card">
            <div className="product-card-tag">入口 / ブランドレイヤー</div>
            <div className="product-card-title">HumanWork Station</div>
            <div className="product-card-def">
              仕事をAIと一緒に「設計し直す」ための入口。
            </div>
            <ul>
              <li>仕事の悩み・課題を言語化</li>
              <li>業種別テンプレートで即スタート</li>
              <li>Agent Studio / Mart への導線</li>
            </ul>
          </div>

          <div className="product-card featured">
            <div className="product-card-tag">仕事OS編集レイヤー ★ Core</div>
            <div className="product-card-title">Agent Studio</div>
            <div className="product-card-def">
              エージェントを「探す・使う・作る・育てる」スタジオ。
            </div>
            <ul>
              <li>Agent Hub — エージェント一元管理</li>
              <li>Agent Suite — AIチームとして運用</li>
              <li>Agent Market — エージェント売買市場</li>
            </ul>
          </div>

          <div className="product-card">
            <div className="product-card-tag">マーケットレイヤー</div>
            <div className="product-card-title">Agent Mart</div>
            <div className="product-card-def">
              実績ある仕事OSパッケージをそのまま持ち込める市場。
            </div>
            <ul>
              <li>業種別キットを検索・導入</li>
              <li>自社フローを商品化・出品</li>
              <li>削減時間・レビューで評価</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== §01 COMPETITIVE LANDSCAPE ===== */
function BenchmarkSection() {
  return (
    <section className="hw-section" id="benchmark">
      <div className="hw-container">
        <div className="section-num">§ 01 — Competitive Landscape</div>
        <h2 className="section-title">で、なぜ <em>HumanWork</em> なのか。</h2>
        <p className="section-sub">
          「AIエージェント × ノーコード × マーケットプレイス」の組み合わせは、すでに巨大企業と機動力あるスタートアップが激しく場所取りをしている領域。HumanWork が立つ場所を、6つの軸で他社と並べて検証する。
        </p>

        <div className="bench-wrap">
          <table className="bench">
            <thead>
              <tr>
                <th>軸 / Axis</th>
                <th>Zapier + AI</th>
                <th>Microsoft Copilot Studio</th>
                <th>Dify / n8n</th>
                <th>OpenAI GPT Store</th>
                <th className="hw-col">HumanWork Station</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>主戦場</td>
                <td>SaaS 同士の連携自動化。汎用ワークフロー。</td>
                <td>大企業の Microsoft 365 環境内。社内業務。</td>
                <td>開発者・テックチームが LLM アプリを構築。</td>
                <td>個人向け GPT カスタマイズ・配布。</td>
                <td className="hw-col"><strong>日本の SMB の「ノイズ仕事」現場。</strong>業種別フローに特化。</td>
              </tr>
              <tr>
                <td>主たるユーザー</td>
                <td>SaaS リテラシー中〜上。マーケ・営業オペ。</td>
                <td>大企業のIT部門。市民開発者。</td>
                <td>エンジニア・PoC 担当。</td>
                <td>個人ユーザー、ChatGPT Plus 層。</td>
                <td className="hw-col">1〜50名規模の事業主・現場リーダー。<strong>情シスがいない</strong>層。</td>
              </tr>
              <tr>
                <td>導入のハードル</td>
                <td>SaaS 同士の API 設定が前提。</td>
                <td>M365 ライセンスとガバナンスが前提。</td>
                <td>セルフホストや開発知識が前提。</td>
                <td>ChatGPT への課金と検索能力。</td>
                <td className="hw-col">業種テンプレ選択 + 5項目入力。<strong>ゼロ開発</strong>。</td>
              </tr>
              <tr>
                <td>マーケットプレイス</td>
                <td>テンプレ集（Zaps）あり。収益化は限定的。</td>
                <td>限定的。社内配布が中心。</td>
                <td>コミュニティ共有はあるが商業流通弱い。</td>
                <td>ストアあり。<strong>収益化に苦戦</strong>。</td>
                <td className="hw-col"><strong>業種特化 × 実績ベースの商業マーケット</strong>。レビュー・削減時間で評価。</td>
              </tr>
              <tr>
                <td>収益モデル</td>
                <td>SaaS サブスク。Zap 数課金。</td>
                <td>M365 アドオン。座席課金。</td>
                <td>OSS / 自社ホスティング。</td>
                <td>ChatGPT Plus / 収益分配（不透明）。</td>
                <td className="hw-col">月額 + Mart 収益分配。<strong>士業・コンサルが商材化</strong>できる。</td>
              </tr>
              <tr>
                <td>言語・文化適合</td>
                <td>英語前提。日本語UIは追従。</td>
                <td>多言語対応。日本語OK。</td>
                <td>多言語対応。</td>
                <td>多言語対応。</td>
                <td className="hw-col"><strong>日本語・日本商習慣ネイティブ</strong>。請求書・印鑑・税理士連携を前提に設計。</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bench-takeaway">
          <h4>★ Takeaway</h4>
          <p>
            HumanWork が勝てる空白地は <strong>「日本のSMB × 業種特化 × ゼロ開発」</strong> の三角形のみ。汎用ノーコードでは Zapier に、IT環境では Microsoft に、開発者層では Dify に勝てない。<br />
            勝負どころは <strong>「情シスがいない会社の、業種固有の業務フロー」</strong> に対してどれだけ深く・正確に・摩擦なく入れるか。
          </p>
        </div>

        <div className="position-map">
          <h4>◇ Positioning Map — Tech Depth × Business Specificity</h4>
          <div className="map-grid">
            <div className="map-axis-y top">← 業種特化</div>
            <div className="map-axis-y bottom">汎用 →</div>
            <div className="map-axis-x left">← 開発不要</div>
            <div className="map-axis-x right">開発前提 →</div>

            <div className="map-dot" style={{ left: '78%', top: '70%' }}><span>Dify / n8n</span></div>
            <div className="map-dot" style={{ left: '55%', top: '60%' }}><span>Zapier + AI</span></div>
            <div className="map-dot" style={{ left: '40%', top: '45%' }}><span>Copilot Studio</span></div>
            <div className="map-dot" style={{ left: '25%', top: '75%' }}><span>GPT Store</span></div>
            <div className="map-dot hw" style={{ left: '18%', top: '22%' }}><span>HumanWork ⌬</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== §02 SPIKE USE CASE ===== */
function UseCaseSection() {
  return (
    <section className="hw-section" id="usecase">
      <div className="hw-container">
        <div className="section-num">§ 02 — Spike Use Case</div>
        <h2 className="section-title">最初の <em>1業種・1業務</em> に絞る。</h2>
        <p className="section-sub">
          汎用シナリオを並べる前に、ひとつの業種・ひとつの摩擦点を、徹底的に深く設計する。「見積り〜請求〜入金確認」を、<strong>制作会社（社員5〜15名規模）</strong> という具体に振り切って描いてみる。
        </p>

        <div className="uc-hero">
          <div className="uc-label">Spike #1 — Owner-Led Production Studio</div>
          <h3>
            都内・社員8名の<em>映像制作会社</em>が、<br />
            毎月15時間を見積り・請求業務に溶かしている。
          </h3>

          <div className="persona">
            <div className="persona-label">Persona</div>
            <div className="persona-body">
              <p><strong>田村さん（46歳・代表）</strong>。映像制作会社を10年経営。社員8名のうち管理担当は田村さん1人と、週3パートの経理さん。</p>
              <p>使っているツール：<strong>Gmail / Excel / freee / Slack</strong>。Notion を導入しようとして3回挫折。Zapier は名前は知っているが触ったことがない。</p>
              <p>悩み：「<strong>受注は来てる。でも事務作業が増えて、自分が編集に入れなくなってきた</strong>」。</p>
            </div>
          </div>
        </div>

        <div className="pain-quote">
          <p>見積書、結局自分で全部つくってる。<br />テンプレはあるけど、案件ごとに条件が違うから、Excel開いて、過去案件コピーして、書き換えて、PDFにして、送る。1件45分。月20件。</p>
          <div className="attrib">— 田村代表 / インタビュー記録</div>
        </div>

        <div className="ba-grid">
          <div className="ba-card before">
            <h5>Before — 現状フロー</h5>
            <ul>
              <li>問い合わせメール受信 → Gmail で読む</li>
              <li>過去類似案件を Excel フォルダから探す（5〜10分）</li>
              <li>見積書テンプレに条件を打ち直す（20分）</li>
              <li>PDF 化してメール送付（5分）</li>
              <li>受注後、別Excelに転記（10分）</li>
              <li>納品後、freee で請求書を手動作成（10分）</li>
              <li>毎週木曜、口座を開いて入金チェック（合計60分/週）</li>
              <li>未入金あれば督促メールを手作業で（毎回考える）</li>
            </ul>
          </div>
          <div className="ba-card after">
            <h5>After — HumanWork Studio</h5>
            <ul>
              <li>Gmail受信 → AIが案件種別を分類して通知</li>
              <li>過去類似案件をAIが自動検索 → 見積ドラフト提示</li>
              <li>田村さんは <strong>金額と工期だけ確認</strong>（3分）</li>
              <li>承認 → PDF・送信文・送付まで自動</li>
              <li>受注時、freee と Slack に自動連携</li>
              <li>納品検知 → 請求書ドラフト生成（freee API）</li>
              <li>入金確認は AI が毎日自動チェック → Slack通知のみ</li>
              <li>未入金 → トーン3段階の督促文を提案・送信</li>
            </ul>
          </div>
        </div>

        <div className="flow">
          <div className="flow-title">▼ Flow Detail — 見積り発行までの30分が、3分になる</div>
          <div className="flow-steps">
            <div className="flow-step">
              <div className="step-num">01</div>
              <div className="step-actor">— Trigger</div>
              <div className="step-text">問い合わせメールが Gmail に着信。件名・本文を AI が解析。</div>
            </div>
            <div className="flow-step ai">
              <div className="step-num">02</div>
              <div className="step-actor">— Agent A</div>
              <div className="step-text">案件種別を分類（CM / 採用動画 / Webムービー / 編集のみ）。優先度判定。</div>
            </div>
            <div className="flow-step ai">
              <div className="step-num">03</div>
              <div className="step-actor">— Agent B</div>
              <div className="step-text">過去案件 DB から類似3件を抽出。料金レンジ・工期・条件をマージ。</div>
            </div>
            <div className="flow-step ai">
              <div className="step-num">04</div>
              <div className="step-actor">— Agent C</div>
              <div className="step-text">見積ドラフトを生成。Slackで田村さんに「これで送りますか?」と通知。</div>
            </div>
            <div className="flow-step">
              <div className="step-num">05</div>
              <div className="step-actor">— Human</div>
              <div className="step-text">田村さんがスマホで「OK」or 数値を1〜2箇所修正。送信。</div>
            </div>
          </div>
        </div>

        <div className="metrics">
          <div className="metric-cell">
            <div className="metric-num">15<em>h</em></div>
            <div className="metric-label">月間 削減時間目安</div>
          </div>
          <div className="metric-cell">
            <div className="metric-num">¥<em>9,800</em></div>
            <div className="metric-label">月額 想定価格</div>
          </div>
          <div className="metric-cell">
            <div className="metric-num">3<em>min</em></div>
            <div className="metric-label">見積1件の所要時間（旧 45min）</div>
          </div>
          <div className="metric-cell">
            <div className="metric-num">¥<em>52,500</em></div>
            <div className="metric-label">時給3,500円換算 / 月の機会創出</div>
          </div>
        </div>

        <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: '18px', color: 'var(--muted)', marginTop: '24px', lineHeight: '1.6', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
          ※ ここを徹底的に解像度高くやる。汎用テンプレ50個より、この1個を圧倒的に磨く方が、市場の最初の信頼を獲得できる。<br />
          <strong style={{ color: 'var(--accent)', fontStyle: 'normal' }}>「映像制作会社の見積りなら HumanWork」</strong> という最初の評判を、ニッチでいいから取りに行く。
        </p>
      </div>
    </section>
  );
}

/* ===== §03 DAY-ONE JOURNEY ===== */
function DayOneSection() {
  return (
    <section className="hw-section" id="dayone">
      <div className="hw-container">
        <div className="section-num">§ 03 — Day-One Journey</div>
        <h2 className="section-title">導入<em>5分</em>で、価値を感じてもらう。</h2>
        <p className="section-sub">
          SMBオーナーがプロダクトを開いてから、「これは違う」と感じる瞬間までの体験設計。SaaSは <strong>初日の5分</strong> に全てが決まる。田村さんが触る想定で、時刻軸で詳細にトレースする。
        </p>

        <div className="journey-frame">
          <div className="journey-bar">
            <div className="bar-title">⌬ The First 12 Minutes</div>
            <div className="bar-clock">経過時間：<span className="red">●</span> 00:00 → 12:00</div>
          </div>

          <div className="timeline">
            <div className="tl-item">
              <div className="tl-time">0:00</div>
              <div className="tl-content">
                <div className="what">— 0分: ランディング到達</div>
                <h4>「あなたの業種は？」<em>ひとつだけ</em>聞かれる。</h4>
                <p>サインアップに名前もメールもクレジットカードも要らない。最初の画面は業種選択のみ。<strong>「映像・動画制作」</strong> をタップ。</p>
                <div className="reaction">あ、これ会員登録じゃないんだ。</div>
              </div>
            </div>

            <div className="tl-item">
              <div className="tl-time">1:00</div>
              <div className="tl-content">
                <div className="what">— 1分: 痛点スキャン</div>
                <h4>「どの作業に <em>一番時間</em> を取られていますか?」</h4>
                <p>4つの選択肢が画像付きで表示。田村さんは <strong>「見積り作成・請求業務」</strong> を選ぶ。</p>
                <div className="reaction">これ、まさに今朝やってたやつ。</div>
              </div>
            </div>

            <div className="tl-item aha">
              <div className="tl-time">3:00</div>
              <div className="tl-content">
                <div className="what">— 3分: ファーストAha! 🔥</div>
                <h4>過去メールを<em>1通</em>だけ貼り付けてもらう。</h4>
                <p>「Gmail 連携の前に、試しに直近の問い合わせメール本文を1通だけ貼ってください」と促される。田村さんが貼り付けると、<strong>10秒で実際の見積書ドラフトが画面に出る</strong>。金額も工期も、過去案件と整合した内容で。</p>
                <div className="reaction">え、これ自分が今日書いたやつとほぼ同じだ……</div>
              </div>
            </div>

            <div className="tl-item">
              <div className="tl-time">5:00</div>
              <div className="tl-content">
                <div className="what">— 5分: ROI 可視化</div>
                <h4>「あなたの場合、<em>月15時間</em> 浮きます」</h4>
                <p>業種・規模・選んだ業務から、田村さんの会社で削減できる時間と金額換算が画面右上に常時表示される。<strong>下にスクロールすると、削減できた時間で「何ができるか」</strong> が3案提示される（編集に入る / 営業に出る / 早く帰る）。</p>
                <div className="reaction">早く帰るに決まってるだろ。</div>
              </div>
            </div>

            <div className="tl-item">
              <div className="tl-time">7:00</div>
              <div className="tl-content">
                <div className="what">— 7分: 連携セットアップ</div>
                <h4>Gmail / freee / Slack を <em>順に</em> つなぐ。</h4>
                <p>最初に Gmail だけ接続をお願いされる。一気に全部つながせない。「まず Gmail だけで、見積りまで動かしてみましょう」と、<strong>最小起動可能な状態</strong> を提案。</p>
                <div className="reaction">全部つなげって言われないの楽だな。</div>
              </div>
            </div>

            <div className="tl-item aha">
              <div className="tl-time">10:00</div>
              <div className="tl-content">
                <div className="what">— 10分: セカンドAha! 🔥</div>
                <h4>翌朝、Slackに「<em>3件</em>の見積りドラフトが届いています」</h4>
                <p>初日は田村さんが帰宅。翌朝、いつも通り Slack を開くと、<strong>夜中に来た問い合わせ3件分の見積ドラフトがすでに準備されている</strong>。スマホで通勤中に2件は「OK」、1件だけ金額を5万円上げて承認。送信完了。</p>
                <div className="reaction">これ、もう手放せないわ。</div>
              </div>
            </div>

            <div className="tl-item">
              <div className="tl-time">12:00</div>
              <div className="tl-content">
                <div className="what">— 12分: 課金モーメント</div>
                <h4>「無料お試しは7日間。続ける場合は月額¥9,800」</h4>
                <p>初日に課金を迫らない。3件の見積りを実際に処理した <strong>体験ベースの確信</strong> を持ってから、料金画面を出す。この時点でチャーンは大幅に減る。</p>
                <div className="reaction">時給換算で考えれば、安すぎる。</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bench-takeaway" style={{ marginTop: '48px' }}>
          <h4>★ Design Principle</h4>
          <p>
            「<strong>サインアップより先に、Aha! を体験させる</strong>」。<br />
            一般的な SaaS は <em>登録 → セットアップ → 利用</em> の順で、SMB は8割が登録段階で離脱する。HumanWork は順序を逆にする。<strong>体験 → 信頼 → 連携 → 課金</strong>。これが SMB 市場で勝つための最重要の設計原則。
          </p>
        </div>
      </div>
    </section>
  );
}

/* ===== §04 AGENT STUDIO PRODUCTS ===== */
function ProductsSection() {
  return (
    <section className="hw-section" id="products">
      <div className="hw-container">
        <div className="section-num">§ 04 — Agent Studio Deep Dive</div>
        <h2 className="section-title">仕事OSの<em>3つの使い方</em>。</h2>
        <p className="section-sub">
          Agent Studio は「探す・使う・作る・育てる」4つの動詞を一カ所に束ねたスタジオ。ユーザーのステージに合わせて、3つのサブブランドが機能する。
        </p>

        <div className="ba-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="ba-card after" style={{ borderColor: '#2c2823', background: 'rgba(44,40,35,0.05)' }}>
            <h5 style={{ color: 'var(--ink)' }}>Agent Hub</h5>
            <ul>
              <li>自分のエージェントを一元管理（My Library）</li>
              <li>稼働状況・実行履歴をダッシュボードで確認</li>
              <li>エージェントのON/OFF・優先度管理</li>
            </ul>
            <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--muted)', marginTop: '16px', lineHeight: '1.5' }}>
              「自分の部下の仕事ぶりを確認する場所」
            </p>
          </div>

          <div className="ba-card after">
            <h5>Agent Suite</h5>
            <ul>
              <li>複数エージェントを「チーム」として運用</li>
              <li>コンサル向け：調査AI＋仮説AI＋資料AI</li>
              <li>マーケ向け：市場AI＋広告AI＋ペルソナAI</li>
            </ul>
            <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--muted)', marginTop: '16px', lineHeight: '1.5' }}>
              「自分専用のAIチームを編成する場所」
            </p>
          </div>

          <div className="ba-card after" style={{ borderColor: '#d4a574', background: 'rgba(212,165,116,0.08)' }}>
            <h5 style={{ color: '#a07840' }}>Agent Market</h5>
            <ul>
              <li>他人が作ったAIエージェントを購入</li>
              <li>自分が作ったAIを販売・収益化</li>
              <li>高品質エージェントが高値で売買される市場</li>
            </ul>
            <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '14px', color: 'var(--muted)', marginTop: '16px', lineHeight: '1.5' }}>
              「プロンプトエンジニアリングが、資産になる。」
            </p>
          </div>
        </div>

        <div className="bench-takeaway" style={{ marginTop: '32px' }}>
          <h4>★ Core Use Cases — Vibe Check</h4>
          <p>
            <strong>Instant Relief</strong> — 「プロフェッショナルを、自販機で買うように。」<br />
            <strong>Custom Forge</strong> — 「秘伝のタレを、システムに焼き付ける。」<br />
            <strong>Agent Artisan</strong> — 「プロンプトエンジニアリングが、資産になる。」<br />
            <strong>Work OS</strong> — 「一人社長が、30人の部下を持つ感覚。」
          </p>
        </div>
      </div>
    </section>
  );
}

/* ===== §05 HUMANWORK OS ARCHITECTURE ===== */

const layers = [
  {
    num: '0',
    name: '職種辞書',
    en: 'World Work Taxonomy',
    desc: '世界中の全職種（1〜10万種）を統合的・階層的に表現する"地球規模の職種ツリー"。ISCO-08・O*NET・日本標準職業分類を統合。',
    ai: 'Taxonomist',
    highlight: false,
  },
  {
    num: '1',
    name: 'タスク辞書',
    en: 'TaskGraph',
    desc: '各職種が日常的に行う"業務タスク"を、粒度統一で階層化。入力・出力・手順・失敗モードまで定義。',
    ai: 'Definition Writer',
    highlight: false,
  },
  {
    num: '2',
    name: '仕事マップ',
    en: 'WorkGraph',
    desc: '職種の業務構造全体を"グラフ構造"で表す「世界仕事マップ」。職種→タスク→スキルを多対多で接続。AIが代替/補完しやすい箇所を可視化。',
    ai: 'Validator',
    highlight: false,
  },
  {
    num: '3',
    name: 'ロールテンプレ',
    en: 'Role Template Library',
    desc: '全職種で"共通のAIサポート構造"を整備するテンプレ群。調査・要約・意思決定支援・議事録など普遍的パターン。',
    ai: 'Def. Writer + Validator',
    highlight: false,
  },
  {
    num: '4',
    name: 'ユースケース辞書',
    en: 'LLM Usecase Engine',
    desc: '各職種×タスク×目的ごとに"AIが何を支援できるか"を体系化した辞書（数十万〜数百万ユースケース）。自動化可能性スコア付き。',
    ai: 'Explorer',
    highlight: false,
  },
  {
    num: '5',
    name: 'エージェント工場',
    en: 'Agent Factory OS (AFOS)',
    desc: '上記辞書を使って、職種専用エージェントを"自動製造"する工場。パラメトリックプロンプト生成・行動モデル生成・バージョン管理まで自動化。',
    ai: 'SPA',
    highlight: true,
  },
  {
    num: '6',
    name: '展開・統合',
    en: 'Deployment & Orchestration',
    desc: '生成されたエージェントをユーザー向けに動かすための層。API化・UI化・マルチエージェント協調・外部サービス連携。',
    ai: 'Orchestrator',
    highlight: false,
  },
  {
    num: '7',
    name: '進化・分析',
    en: 'Analytics & Evolution',
    desc: 'エージェント全体の性能を観測し改良する"進化環境"。エラー検出→プロンプト改良→新業務の自動検知→LLMアップデート時の自動最適化。',
    ai: 'Evaluator',
    highlight: false,
  },
];

const afosSteps = [
  { num: '000', name: 'ヒアリング' },
  { num: '001', name: 'タスク分解' },
  { num: '002', name: 'ユースケース案出し' },
  { num: '003', name: 'エージェントリストアップ' },
  { num: '004', name: '要求定義' },
  { num: '005', name: '要件定義' },
  { num: '006', name: '基本設計' },
  { num: '007', name: '詳細設計' },
  { num: '008', name: 'ドラフト' },
  { num: '009', name: 'レビュー' },
  { num: '010', name: '完成' },
];

function OSArchSection() {
  return (
    <section className="hw-section" id="os-arch">
      <div className="hw-container">
        <div className="section-num">§ 05 — HumanWork OS Architecture</div>
        <h2 className="section-title">世界の全職種 × 全業務 × <em>全AIユースケース</em>。</h2>
        <p className="section-sub">
          HumanWork OS（HWOS）は、ユーザーが直接触れる思想レイヤー。Layer 0〜7 の8層構造が、エージェント経済圏の哲学的バックボーンを形成する。
        </p>

        <div className="os-arch">
          <div className="layer-stack">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.num}
                className={`layer-item${layer.highlight ? ' highlight' : ''}`}
              >
                <div className="layer-num">L{layer.num}</div>
                <div className="layer-name">
                  <div>
                    <strong>{layer.name}</strong>
                    <span className="layer-en">{layer.en}</span>
                  </div>
                </div>
                <div className="layer-desc">{layer.desc}</div>
                <div className="layer-ai">
                  <span className="layer-ai-tag">{layer.ai}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="afos-title">▼ AFOS製造ライン — Agent Factory OS / 000〜010</div>
          <div className="afos-steps">
            {afosSteps.map((step) => (
              <div key={step.num} className="afos-step">
                <div className="afos-step-num">{step.num}</div>
                <div className="afos-step-name">{step.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bench-takeaway" style={{ marginTop: '48px' }}>
          <h4>★ Architecture Note</h4>
          <p>
            Layer 0〜7 は"思想・哲学のレイヤー"として裏側に格納。ユーザーが触るのは <strong>Agent Studio</strong> のみ。HWOS はホワイトペーパー・技術論文・長期思想の中心軸として機能する。
            <br /><em>HumanWork OS = 「AIが仕事をする世界」をつくるためのオペレーティングシステム。</em>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ===== FOOTER ===== */
function HWFooter() {
  return (
    <footer className="hw-footer">
      <div className="hw-container">
        <div className="footer-mark">⌬ HumanWork — End of Discussion Paper Vol. 01 ⌬</div>
        <div className="footer-meta">
          Next Steps · 1業種ユーザーインタビュー / Spike実装 / 価格テスト<br />
          Status: For Founder Review · Internal Draft Only · 2026.05<br />
          Human Work Inc. — 神奈川県 · 代表：嶋崎圭一郎
        </div>
      </div>
    </footer>
  );
}

/* ===== PAGE EXPORT ===== */
export default function HumanWorkStation() {
  return (
    <div className="hw-page">
      <Masthead />
      <MissionSection />
      <BenchmarkSection />
      <UseCaseSection />
      <DayOneSection />
      <ProductsSection />
      <OSArchSection />
      <HWFooter />
    </div>
  );
}
