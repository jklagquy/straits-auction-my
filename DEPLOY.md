# product-site 部署清单（Supabase + Vercel）

## 1. Supabase

1. 新建项目（建议区域选新加坡 `ap-southeast-1`）
2. SQL Editor 依次执行：
   - `supabase/migrations/001_auction_cms.sql`
   - `supabase/migrations/002_logo_storage.sql`
   - `supabase/migrations/003_comments_engagement.sql`（评论表 + 评论/点赞权限开关）
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

1. Import `product-site` 目录（或 monorepo root + Root Directory = `product-site`）
2. 填入上述环境变量
3. Deploy
4. 绑定域名

## 4. 上线后

1. 打开 `/admin/login` → 站点设置：上传 Logo、填公司信息 / WhatsApp
2. 站点设置里的「评论权限 / 点赞权限」：关闭后，主站点击会弹出「会员操作」（随 cn/zh/en 切换）
3. 藏家动态 → 编辑 →「管理评论」可分页增删改评论
4. 拍品 / 新闻 / 动态 / 横幅：在后台上传真实内容
5. 前台 `/{cn|zh|en}` 验证品牌与联系方式已生效
