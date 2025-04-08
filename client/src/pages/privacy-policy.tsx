import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="space-y-8">
        <div className="space-y-4">
          <Link href="/" className="text-primary hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold">プライバシーポリシー</h1>
          <p className="text-muted-foreground">最終更新日: 2025年4月8日</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. はじめに</h2>
          <p>
            ライフビジョンアプリ（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
            このプライバシーポリシーでは、当サービスの利用にあたり収集、使用、開示される情報の取り扱いについて説明します。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. 収集する情報</h2>
          <p>当サービスでは、以下の情報を収集する場合があります：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>アカウント情報</strong>：ユーザー名、メールアドレス、パスワード</li>
            <li><strong>プロフィール情報</strong>：年齢層、性別、家族構成、職業、居住地域</li>
            <li><strong>質問回答データ</strong>：アンケートや質問への回答、興味・関心、課題</li>
            <li><strong>生成コンテンツ</strong>：AIによって生成されたビジョン文書やその他のコンテンツ</li>
            <li><strong>利用データ</strong>：アクセスログ、デバイス情報、IPアドレス</li>
            <li><strong>第三者サービス連携情報</strong>：Pinterest等の外部サービスと連携する場合、それらのサービスから提供される情報</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用されます：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>サービスの提供・維持・改善</li>
            <li>ユーザーのアカウント管理</li>
            <li>パーソナライズされたコンテンツや推奨事項の提供</li>
            <li>サービスの利用状況の分析</li>
            <li>サポートの提供</li>
            <li>通知や連絡事項の送信</li>
            <li>不正利用の検出・防止</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. 情報の共有・開示</h2>
          <p>当サービスは、以下の場合を除き、ユーザーの個人情報を第三者と共有しません：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>コミュニティ機能</strong>：ユーザーが共有を選択した場合、指定された情報が他のユーザーに公開されます</li>
            <li><strong>サービス提供者</strong>：サービス運営に必要なクラウドサービス、分析ツール等のプロバイダーと情報を共有する場合があります</li>
            <li><strong>法的要請</strong>：法律、規制、法的手続きまたは政府の要請に応じる必要がある場合</li>
            <li><strong>権利保護</strong>：当サービスの権利、財産、安全を保護するために必要な場合</li>
            <li><strong>事業譲渡</strong>：合併、買収、資産売却等の取引の一部として情報が譲渡される場合</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. 第三者サービスとの連携</h2>
          <p>
            当サービスはPinterest API等の外部サービスと連携する機能を提供しています。これらのサービスを利用する場合、
            該当するサービスのプライバシーポリシーも適用されます。ユーザーは各サービスのプライバシーポリシーを確認することをお勧めします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. データセキュリティ</h2>
          <p>
            当サービスはユーザー情報を保護するための適切な技術的・組織的対策を実施していますが、
            インターネット上の送信やデジタル記憶装置の安全性について100%の保証はできません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. ユーザーの権利</h2>
          <p>ユーザーには以下の権利があります：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>個人情報へのアクセス</li>
            <li>個人情報の修正</li>
            <li>個人情報の削除</li>
            <li>個人情報の処理に対する制限</li>
            <li>データポータビリティ</li>
            <li>同意の撤回</li>
          </ul>
          <p>
            これらの権利を行使するには、当サービスの連絡先までお問い合わせください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. クッキーとトラッキング技術</h2>
          <p>
            当サービスは、ユーザー体験の向上、分析、マーケティング目的でクッキーや類似の追跡技術を使用することがあります。
            これらの技術の使用を制限するには、ブラウザの設定を調整してください。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. お子様のプライバシー</h2>
          <p>
            当サービスは13歳未満のお子様を対象としていません。13歳未満のお子様から個人情報を収集していると判明した場合、
            速やかにその情報を削除するための措置を講じます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. プライバシーポリシーの変更</h2>
          <p>
            当サービスは、必要に応じてこのプライバシーポリシーを更新することがあります。
            変更があった場合は、更新日を変更し、必要に応じてユーザーに通知します。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. お問い合わせ</h2>
          <p>
            このプライバシーポリシーに関するご質問やご意見がある場合は、以下の連絡先までお問い合わせください。
          </p>
          <p>メールアドレス: support@lifevisionapp.example.com</p>
        </section>
      </div>
    </div>
  );
}