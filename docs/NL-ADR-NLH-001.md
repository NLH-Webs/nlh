# NL-ADR-NLH-001 — nlh.nhi.sg: giữ HTML tĩnh hay chuyển Next.js
**Version:** v1.0 · **Date:** 26/09/2026 · **Người soạn:** Tyna + Claude · **Người duyệt:** chị Nhi · **Status:** Approved (26/09/2026 — Tyna xác nhận chị Nhi đã duyệt)

## Bối cảnh
- Chuẩn NL-QA-NHILE-001 (T1, P0): lệch stack mà không có ADR được duyệt là Red Flag. Stack trang public theo chuẩn hiện hành là Next.js 15 + OpenNext (`CLAUDE.md` §3; một số tài liệu cũ ghi Next.js 14).
- nlh.nhi.sg là một trang HTML tĩnh (`index.html`): mọi màu, cỡ chữ, khoảng cách đi qua `nlh/nlh-tokens.css` (chép nguyên văn từ `NLH-CORE/design-system`). Không có dữ liệu động, không đăng nhập. Form liên hệ `nlh-contact` gửi về NhiLe Leads + contact@nhi.sg.
- Mục Dịch vụ (NL-PRD-CLAUDESVC-001) được thêm vào trang này, không tách thành trang riêng.

## Hai phương án
| | A. Ngoại lệ: giữ HTML tĩnh | B. Chuyển sang Next.js 15 + OpenNext |
|---|---|---|
| Công | Gần 0 — sửa thẳng `index.html` | Khoảng 1–2 ngày: tách khối thành component, giữ nguyên chữ và token |
| Bảo trì | Sửa chữ = sửa một file | Sửa qua component; cần người biết Next.js |
| Rủi ro | Thêm một chỗ lệch stack | Không đáng kể; giao diện không đổi vì đã đi qua token |

## Quyết định
**A — giữ HTML tĩnh**, với điều kiện:
1. Không thêm đăng nhập, dữ liệu động hay form mới vào trang. Muốn thêm → chuyển sang B trước.
2. Không viết mã màu, cỡ chữ, khoảng cách trong trang — chỉ gọi biến của `nlh-tokens.css`.
3. `nlh/nlh-tokens.css` luôn là bản chép nguyên văn từ `NLH-CORE/design-system`.

## Hệ quả
- Gỡ Red Flag "lệch stack chưa có ADR" (T1) cho nlh.nhi.sg.
- Khi điều kiện 1 bị chạm tới, mở ADR mới để chuyển sang B.

## Changelog
- **v1.0 — 26/09/2026:** chị Nhi duyệt phương án A (Tyna xác nhận).
- **v0.1 — 26/09/2026:** bản nháp đầu trong gói claude-services.
