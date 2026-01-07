import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { HelpCircle, FileText, Settings, CreditCard } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const meta: Meta = {
  title: "Data Display/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>アコーディオン1</AccordionTrigger>
        <AccordionContent>
          アコーディオン1のコンテンツです。クリックで開閉できます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>アコーディオン2</AccordionTrigger>
        <AccordionContent>
          アコーディオン2のコンテンツです。複数のアイテムを持つことができます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>アコーディオン3</AccordionTrigger>
        <AccordionContent>
          アコーディオン3のコンテンツです。長いテキストも表示できます。
          アコーディオンは情報を整理して表示するのに便利なコンポーネントです。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: StoryObj = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>複数開くことができます</AccordionTrigger>
        <AccordionContent>
          このアコーディオンは複数のアイテムを同時に開くことができます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>2つ目のアイテム</AccordionTrigger>
        <AccordionContent>
          他のアイテムが開いていても、このアイテムを開くことができます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>3つ目のアイテム</AccordionTrigger>
        <AccordionContent>
          すべてのアイテムを同時に開くこともできます。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const DefaultOpen: StoryObj = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-2" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>最初のアイテム</AccordionTrigger>
        <AccordionContent>
          最初のアイテムのコンテンツです。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>デフォルトで開いているアイテム</AccordionTrigger>
        <AccordionContent>
          このアイテムはデフォルトで開いた状態で表示されます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>3つ目のアイテム</AccordionTrigger>
        <AccordionContent>
          3つ目のアイテムのコンテンツです。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const FAQ: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="size-5" />
        <h2 className="text-lg font-semibold">よくある質問</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq-1">
          <AccordionTrigger>サービスの料金はいくらですか？</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">
              基本プランは月額¥1,000から、プロプランは月額¥3,000から、
              エンタープライズプランは要お問い合わせとなっております。
              詳細は料金ページをご確認ください。
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>無料トライアルはありますか？</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">
              はい、14日間の無料トライアルをご用意しております。
              クレジットカードの登録は不要です。
              トライアル期間中はすべての機能をお試しいただけます。
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger>解約方法を教えてください。</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">
              設定画面の「サブスクリプション」から、いつでも解約いただけます。
              解約後も次の請求日までサービスをご利用いただけます。
              データは解約後30日間保持されます。
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-4">
          <AccordionTrigger>サポートへの問い合わせ方法は？</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">
              サポートへは以下の方法でお問い合わせいただけます：
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
              <li>メール: support@example.com</li>
              <li>チャット: 画面右下のチャットアイコンから</li>
              <li>電話: 平日9:00-18:00 (0120-XXX-XXX)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const WithIcons: StoryObj = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="docs">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <FileText className="size-4" />
            <span>ドキュメント</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          APIリファレンス、チュートリアル、ガイドなどのドキュメントにアクセスできます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="settings">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>設定</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          アカウント設定、通知設定、セキュリティ設定などを変更できます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4" />
            <span>請求情報</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          請求履歴の確認、支払い方法の変更、請求書のダウンロードができます。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const NestedContent: StoryObj = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>詳細な情報</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              アコーディオンの中には様々なコンテンツを入れることができます。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">項目1</p>
                <p className="text-xs text-muted-foreground">説明文</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">項目2</p>
                <p className="text-xs text-muted-foreground">説明文</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>リスト項目1</li>
              <li>リスト項目2</li>
              <li>リスト項目3</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
