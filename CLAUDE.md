# CLAUDE.md — Dự án NhiLe Holding (NLH)

> Đặt tại thư mục gốc của repo NhiLe (`nedu-*`, `nlh-*`, `*.nquoc.vn`) với tên `CLAUDE.md`.
> Repo đã có `CLAUDE.md` (ví dụ mục Git Flow hoặc spec sản phẩm) → **chèn** nội dung này vào, KHÔNG ghi đè.
> File này được commit cho cả team, nên không chứa thông tin cá nhân.

---

## 1. Bối cảnh công ty

- **NhiLe Holding** — pháp nhân: **Công ty Cổ phần NhiLe Holding** (NHILE HOLDING JOINT STOCK COMPANY), MST 0402230476, trụ sở tại Đà Nẵng (masothue.com, kiểm 26/09/2026). Founder: chị **Lê Thảo Nhi**.
  - **NhiLe Pte. Ltd.** (Singapore, UEN 201934699R) thuộc hệ sinh thái; **N Digital Marketing** là đơn vị của NhiLe Pte. Ltd. Trang NLH được giới thiệu dịch vụ tiếp thị của N Digital Marketing, nhưng phải ghi rõ đơn vị thực hiện.
  - **Family Cloud** là công ty IT **đối tác** về nhân sự công nghệ, không phải công ty con.
- **Hệ sinh thái sản phẩm:**
  - **Nedu:** 6 portal: nedu.vn, cms, ops, learn, instructor, alumni.
  - **NQuoc:** tracker và dashboard vận hành nội bộ, 8 portal theo team.
  - **N-ơi:** matching engine.
  - Marketing Hub, Creator OS, hieucon.vn.
- **Chuẩn vận hành "Singapore Way":** kỷ luật, chuẩn hóa, ra quyết định dựa trên dữ liệu, đơn giản.
  - Quy trình theo SOP, dùng 9 tài liệu chuẩn cho mỗi team.
  - **ICD** là chuẩn giao tiếp nội bộ, thay cho email.
- **Cơ cấu 4 cấp:** Volunteer → Co-Leader → Leader → Operation.
- **Triết lý:** "Việt Nam hội nhập không hòa tan". Áp chuẩn chuyên nghiệp quốc tế nhưng giữ bản sắc Việt, nhất là tình đồng đội và sự gắn kết cảm xúc.
- **Màu thương hiệu:** navy, gold, teal, green.

## 2. 7 nguyên tắc sản phẩm (mọi tính năng phải qua)

1. **Blue Ocean:** tính năng có rút ngắn được cửa sổ 18–24 tháng để tạo lợi thế phòng thủ không? Nếu không → hoãn hoặc bỏ.
2. **Anti-bloat (130 → 20 người):** chi phí duy trì là bao nhiêu? Tính năng phải tự chạy, do cộng đồng vận hành, hoặc không làm.
3. **AI-first:** thiết kế để AI agent vận hành được ngay từ đầu, không gắn AI vào sau.
4. **Tầm 300 năm:** tính năng có còn hợp lý ở năm thứ 30 không? Nếu là thứ có tuổi thọ ngắn thì nói rõ.
5. **Hợp văn hóa Việt:** thiết kế theo cách người Việt nghĩ và tin tưởng, không mặc định theo kiểu Silicon Valley.
6. **Nhất quán thương hiệu founder:** không làm loãng thương hiệu của chị Nhi.
7. **Khớp mô hình doanh thu:** gắn được vào một gói (Seeker / Alumni Practitioner / Thiên Mệnh / Là Chính Mình). Tính năng miễn phí cần lý do mạnh hơn.

**Chưa có PRD, metric hoặc kill criteria → dừng lại, viết spec trước khi code.**

## 3. Stack bắt buộc (dùng pnpm)

**Chọn stack:** cần SEO (trang public) → **Next.js 15** App Router + OpenNext. Không cần SEO (dashboard nội bộ) → **Vite 8** SPA. Không gộp cả hai vào một project.

| Lớp | Vite portal | Next.js public |
|---|---|---|
| Framework | Vite 8 + React 19 | Next.js 15 + React 19 |
| Ngôn ngữ | TypeScript strict | TypeScript strict |
| Routing | React Router v7 | App Router |
| Server state | TanStack Query v5 | fetch trong RSC |
| Client state | Zustand v5 | useState / Suspense |
| Styling | Tailwind v4 | Tailwind v4 |
| Mock | MSW v2 | MSW hoặc constants |
| Auth | auth-central (NLH-CORE), token `nlh_access_token` / `nlh_refresh_token` | không có |
| Analytics | GA4 + Clarity | GA4 + Clarity |
| Deploy | Cloudflare | Cloudflare qua OpenNext |

- **Cấm thêm:** Redux, Recoil, Jotai, SWR, Axios, Prisma client, styled-components, Emotion, MUI, Ant Design, shadcn. **Không dùng Vercel.**
- **Tailwind v4:**
  - `@import "tailwindcss";` đặt đầu `index.css`, dùng plugin `@tailwindcss/vite`, không có `tailwind.config.ts`.
  - Reset `*{}` phải bọc trong `@layer base{}`.
  - Token màu và font khai trong `:root{}` hoặc `@theme{}`.
- **Lưu ý:** một số tài liệu cũ ghi stack Next.js 14 + Supabase + Express + Vercel. Với code frontend, **bảng trên là chuẩn hiện hành**. Nếu phát hiện mâu thuẫn, hỏi lại trước khi làm.
- Muốn lệch chuẩn vì lý do chính đáng → ghi vào `CLAUDE.md` của repo đó, kèm **Why** và **How to apply**.

## 4. Git flow (bắt buộc)

- Chỉ có **một nguồn** là `origin`, tức repo org NhiLe. **Không bao giờ** commit hoặc push thẳng vào `dev` hay `main`. Code chỉ vào hai nhánh này qua Pull Request.
- **Trước khi code:**
  1. `git fetch origin`.
  2. Đang ở `main` → chuyển sang `dev` mới nhất.
  3. Làm việc trên branch tách từ `origin/dev` mới nhất.
- **Tech:**
  - Tạo branch `feat/<mô-tả>` → mở PR vào `dev`.
  - Giới hạn mỗi PR: tối đa 24h, 5 commit, 20 file. Mô tả có `## Summary` và `## Test Plan`.
  - CI phải xanh, có ít nhất 1 approve, người merge phải khác người tạo PR.
  - Chỉ Tech Lead được mở PR vào `main`.
- **Non-tech:**
  - Tạo branch `ui/<mô-tả>`, làm giao diện với data giả, commit, push, rồi tự deploy bản xem thử. **Không mở PR**, team IT sẽ đưa vào `dev`.
  - Chỉ cần nói: *"commit, push và deploy cho tôi"*.
- **Một branch làm một trang.**
- **Không dùng `--no-verify`.** Repo mới phải bật **branch protection** cho `dev` và `main`, và cài husky `pre-commit` và `pre-push`.

## 5. Deploy (chỉ dùng Cloudflare)

- **Bản xem thử cá nhân** (dùng tài khoản Cloudflare **của chính người đó**, không dùng chung tài khoản):
  - Lần đầu: `pnpm exec wrangler login`.
  - Vite: `pnpm build && pnpm exec wrangler deploy --name <repo>`
  - Next.js: `pnpm cf:build && pnpm exec wrangler deploy --name <repo>`
  - Tuyệt đối không deploy tay lên `--name <repo>-dev` hoặc `-prod`.
- **Bản chính:** Cloudflare Workers Builds tự build khi merge. Merge vào `dev` → `<repo>-dev`. Merge vào `main` → `<repo>-prod`.
- **Không tạo** script `deploy:dev` hoặc `deploy:prod` trong `package.json`.

## 6. Luật Vàng khi chuyển HTML sang React cho non-tech

1. Không dùng đăng nhập thật: không OAuth, Supabase, Firebase; không gọi `auth-central` thật; không đưa secret vào `.env`.
2. Mọi dữ liệu là data giả qua MSW + hook TanStack Query, không hard-code trong JSX.
3. Màn đăng nhập trong file HTML: giữ nguyên hình thức, nút bấm chỉ `navigate('/dashboard')` kèm comment `// MOCK: IT nối đăng nhập thật sau`.
4. Gặp URL hoặc API thật trong file HTML → thay bằng mock.
5. Bản xem thử luôn bật `VITE_ENABLE_MOCKING=true`, analytics để tắt.
6. Màu, font, bố cục lấy thẳng từ file HTML của team. Chỉ khung kỹ thuật là bắt buộc giữ đúng chuẩn.

## 7. 8 repo theo team — chỉ làm đúng repo của mình

Org GitHub: `NLH-NQUOC-LABS`. Các repo: `Admin.nquoc.vn`, `Academy.nquoc.vn`, `SocialEvent.nquoc.vn`, `N-Education.nquoc.vn`, `HR.nquoc.vn`, `Edit.nquoc.vn`, `Design.nquoc.vn`, `IT.nquoc.vn`.

- Kiểm tra `git remote -v` trước. Không khớp repo của team → **dừng lại và báo**.
- Chưa rõ context thì hỏi 2 câu: *làm trang mới hay sửa trang cũ?* và *bạn thuộc team nào?*

## 8. Tài liệu và đào tạo

- **Chương trình đào tạo lãnh đạo 30 ngày cho đội NLT (130+ người):**
  - Chia 4 tuần: **Gốc Rễ / Thân Cây / Cành Lá / Hoa Quả**, mỗi ngày có từ khóa riêng.
  - Bản mới nhất: `NL-SLIDES-LEADERSHIP-001_v2.pptx`, 24 slide, dùng màu thương hiệu. Có thêm các slide về bối cảnh trước/sau chuyển đổi, cơ cấu 4 cấp và Singapore Way.
  - Mỗi slide chi tiết theo ngày có box **"Trong NhiLe:"** nối khái niệm với công cụ và quy trình thật.
- **Quy ước đặt tên:** `NL-<LOẠI>-<CHỦ ĐỀ>-<SỐ>_v<n>` (ví dụ `NL-SLIDES-...`, `NL-FORM-...`, `NL-QA-NHILE-001`).
- **Cách làm:** dựng cấu trúc trước, rồi nội dung, rồi bối cảnh NhiLe. Khái niệm nào cũng phải gắn với công cụ thật (NQuoc, ICD, SOP).

## 9. Bàn giao cho IT

Gói bàn giao gồm:
- User story P0/P1/P2
- Schema SQL
- API endpoint spec
- Ma trận role/permission
- Tài liệu handoff

Portal cần có `architecture.md`, gộp từ API contract đã được Data Guard duyệt + `prototype.html` + `userstory.md` + `bigpicture.md`.

## 10. Repo `nlh` (nlh.nhi.sg) — chỗ đang lệch chuẩn

- **Stack:** trang là HTML tĩnh (`index.html` + `nlh/nlh-tokens.css`), chưa phải Next.js 15 + OpenNext như §3.
  - **Why:** chị Nhi duyệt ADR [`docs/NL-ADR-NLH-001.md`](docs/NL-ADR-NLH-001.md) v1.0 ngày 26/09/2026 — phương án A, giữ HTML tĩnh.
  - **How to apply:** sửa trong HTML tĩnh, mọi màu, cỡ chữ, khoảng cách đi qua token `nlh-tokens.css`; không thêm form, dữ liệu động hay đăng nhập — muốn thêm thì mở ADR mới để chuyển sang Next.js 15.
- **Git flow:** `origin/dev` đang chậm hơn `main` 28 commit (kiểm 26/09/2026), nên branch tạm tách từ `main`.
  - **Why:** tách từ `dev` sẽ mất trang chủ hiện tại.
  - **How to apply:** dùng `ui/<mô-tả>` tách từ `origin/main`, không mở PR; báo Tech Lead đồng bộ `dev` với `main`. Khi `dev` đã kịp `main` thì quay lại tách từ `origin/dev`.
- Repo chưa có husky, `.gitattributes` và branch protection theo §4 — việc của Tech Lead.
- **Màu thương hiệu:** trang dùng `data-brand="nlh"` — vàng kim NhiLe Holdings `#d4a017` (bảng "Dark Premium" của NL-QA-NHILE-001). Token `--brand-nlh*` là **v1.3.2**, chị Nhi duyệt 26/09/2026 qua Cổng Durov (Tyna xác nhận); PR vào `main` của `NLH-CORE/design-system` từ nhánh `design/brand-nlh-v1.3.2`.
  - **Why:** bộ token v1.3.1 chỉ có Nedu · NhiLe Team · N-ơi · NQuoc; mặc vàng Nedu trên trang Holding là Red Flag "sai màu brand".
  - **How to apply:** `nlh/nlh-tokens.css` phải là bản chép nguyên văn từ design-system. Không viết mã màu trong `index.html`. Khi PR token đã merge, chép lại token từ `main` của design-system.
- **Kiểm thử trên điện thoại thật:** mục Dịch vụ trên bản preview đã thử trên iPhone và Android — Tyna xác nhận 26/09/2026.
