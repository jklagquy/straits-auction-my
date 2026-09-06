# product-site 部署清单（Supabase + Vercel）

## 1. Supabase

1. 新建项目（建议区域选新加坡 `ap-southeast-1`）
2. SQL Editor 依次执行：
   - `supabase/migrations/001_auction_cms.sql`
   - `supabase/migrations/002_logo_storage.sql`
   - `supabase/migrations/003_comments_engagement.sql`（评论表 + 评论/点赞权限开关）
   - 后续按文件名继续执行至 `008_site_public_enabled.sql`（主站前台开关）
3. 本地填好 `.env.local` 后执行：
   ```bash
   npm run supabase:setup
   npm run seed:comments
   ```
   （`seed:comments` 为每条藏家动态生成 2000–8000 条不重复数量的本地化评论，约 70% 马来华人语气 + 30% 多国语言，随机穿插。全量约十几万条，需数分钟。）
   本地冒烟可用：`npm run seed:comments:lite`

## 2. 环境变量（Vercel / 本地）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=（强密码）
ADMIN_SECRET=（随机长字符串）
```

## 3. Vercel

1. Import GitHub 仓库 `jklagquy/straits-auction-my`（Root Directory 留空；仓库根即 Next 项目）
2. 填入上述环境变量
3. Deploy
4. 绑定域名

### 3.1 从 abogdanit992 迁回 jklagquy（推荐顺序）

当前线上若由 **abogdanit992** 的 Vercel 连着 fork 在部署，而代码/Supabase 在 **jklagquy**：

1. 用 **jklagquy** 登录 [vercel.com](https://vercel.com)
2. **Add New → Project** → Import `jklagquy/straits-auction-my`
3. Framework: Next.js；Root Directory **留空**
4. 环境变量从旧项目逐条复制（`NEXT_PUBLIC_SUPABASE_*`、`SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_PASSWORD`、`ADMIN_SECRET`）——用 Dashboard 粘贴，避免 PowerShell 带入 `\r\n`
5. Deploy，确认预览域名上藏品图/动态图正常
6. **Settings → Domains**：把生产域名从旧项目移到新项目（或先加域名再在旧项目删除）
7. 旧 abogdanit992 项目可暂停/删除，避免双线部署
8. （可选）GitHub fork `abogdanit992/straits-auction-my` 不再需要给 Vercel 用时可忽略

**不必**把 Supabase 换账号：继续用现有 `cadmzktpescqvefyxroo` 项目即可（GitHub 仅用于登录 Supabase 也无妨）。

## 4. 上线后

1. 打开 `/admin/login` → 站点设置：上传 Logo、填公司信息 / WhatsApp
2. 站点设置里的「主站前台开放」：取消勾选后，访客打开本域名看不到任何前台内容；后台 `/admin` 仍可登录。域名不会注销。
3. 站点设置里的「评论权限 / 点赞权限」：关闭后，主站点击会弹出「会员操作」（随 cn/zh/en 切换）
4. 藏家动态 → 编辑 →「管理评论」可分页增删改评论
5. 拍品 / 新闻 / 动态 / 横幅：在后台上传真实内容
6. 前台 `/{cn|zh|en}` 验证品牌与联系方式已生效
