import { Link } from "wouter";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold">利用規約</h1>
          <p className="text-muted-foreground">最終更新日: 2025年4月8日</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. はじめに</h2>
          <p>
            ライフビジョンアプリ（以下「当サービス」）をご利用いただき、ありがとうございます。
            本規約は、当サービスの利用に関するお客様との合意事項を定めるものです。
            サービスを利用することにより、お客様は本規約に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. サービスの説明</h2>
          <p>
            当サービスは、AIを活用してユーザーのライフビジョン策定を支援するオンラインプラットフォームです。
            ユーザーの回答に基づき、パーソナライズされたビジョンステートメントを生成し、目標達成をサポートします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. アカウント登録</h2>
          <p>
            当サービスの一部機能を利用するには、アカウント登録が必要です。登録の際には、
            正確で最新の情報を提供してください。アカウント情報の機密性を保持し、
            不正アクセスが発生した場合は直ちに報告する責任があります。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. 禁止事項</h2>
          <p>当サービスを利用するにあたり、以下の行為を禁止します：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>法律、規制または本規約に違反する行為</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>他のユーザーを詐欺、脅迫、嫌がらせする行為</li>
            <li>不適切、攻撃的、または有害なコンテンツを投稿・共有する行為</li>
            <li>当サービスのセキュリティを侵害する行為</li>
            <li>当サービスの不正使用または悪用</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. 知的財産権</h2>
          <p>
            当サービスのコンテンツ、デザイン、ロゴ、ソフトウェアは、当社または
            ライセンサーの知的財産権によって保護されています。ユーザーが生成したコンテンツの
            著作権はユーザーに帰属しますが、当サービス内での表示や改善のために
            使用する権利を当社に許諾するものとします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. プライバシー</h2>
          <p>
            当サービスのプライバシーポリシーは、個人情報の収集、使用、共有について
            説明しています。サービスを利用することにより、ユーザーはプライバシーポリシーに
            同意したものとみなされます。
          </p>
          <p>
            <Link href="/privacy-policy" className="text-primary hover:underline">
              プライバシーポリシーを読む
            </Link>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. 第三者サービス</h2>
          <p>
            当サービスはPinterest等の第三者サービスとの連携機能を提供しています。
            これらのサービスを利用する場合、該当するサービスの利用規約も適用されます。
            第三者サービスの利用に関して当社は責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. 免責事項</h2>
          <p>
            当サービスは「現状有姿」で提供され、特定の目的への適合性、正確性、完全性等を
            含め、明示的または黙示的な保証はありません。当サービスの利用により生じた
            いかなる損害についても、法律で禁止されている場合を除き、当社は責任を負いません。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. 責任の制限</h2>
          <p>
            法律で許容される最大限の範囲において、当社はいかなる間接的、付随的、特別、
            懲罰的または派生的損害について責任を負いません。当社の責任は、いかなる場合も
            過去12ヶ月間にユーザーが当サービスに支払った金額を超えないものとします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. 変更と終了</h2>
          <p>
            当社は、いつでも本規約を変更する権利を留保します。重要な変更がある場合は、
            事前に通知します。また、当社はユーザーへの通知の有無にかかわらず、
            いつでもサービスの全部または一部を一時停止または終了する権利を有します。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">11. 準拠法と管轄</h2>
          <p>
            本規約は日本国の法律に準拠し、解釈されるものとします。本規約に関連する
            紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">12. お問い合わせ</h2>
          <p>
            本規約に関するご質問やご意見がある場合は、以下の連絡先までお問い合わせください。
          </p>
          <p>メールアドレス: support@lifevisionapp.example.com</p>
        </section>
      </div>
    </div>
  );
}