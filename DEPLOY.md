# product-site 部署清单（Supabase + Vercel）

## 1. Supabase

1. 新建项目（建议区域选新加坡 `ap-southeast-1`）
2. SQL Editor 依次执行：
   - `supabase/migrations/001_auction_cms.sql`
   - `supabase/migrations/002_logo_storage.sql`
3. 本地填好 `.env.local` 后执行：
   ```bash
   npm run supabase:setup
   ```
   （把种子数据写入云端）

## 2. 环境变量（Vercel / 本地）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=（强密码）
ADMIN_SECRET=（随机长字符串）
```

## 3. Vercel

1. Import `product-site` 目录（或 monorepo root + Root Directory = `product-site`）
2. 填入上述环境变量
3. Deploy
4. 绑定域名

## 4. 上线后

1. 打开 `/admin/login` → 站点设置：上传 Logo、填公司信息 / WhatsApp
2. 拍品 / 新闻 / 动态 / 横幅：在后台上传真实内容
3. 前台 `/{cn|zh|en}` 验证品牌与联系方式已生效
