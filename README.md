# terminal/ — 서버 없는 장비 단말 (구조 ②)

장비 화면이 **우리 서버 없이 블록체인(Sepolia)에 직접** 자격을 묻는 버전이에요.
인터넷만 되면 장비가 어디에 있든 동작하고, 휴대폰은 PC와 같은 와이파이일 필요가 없어요.

```
장비 화면(PC·태블릿)                휴대폰 (MetaMask 앱)               Sepolia
 ① 일회용 QR 표시  ──카메라로 찍기──▶  ② 문장에 서명 (개인 키는 앱 안에만)
 ④ 응답 QR 읽기   ◀──화면 보여 주기──  ③ 응답 QR 표시
 ⑤ 서명 → 주소 복원 → isQualified 조회 ───────────────────────────▶  (가스 0)
 ⑥ 시동 허용 / 거부
```

| 파일 | 역할 |
|---|---|
| `index.html` | 장비 단말 화면 (QR 발급, 카메라로 응답 읽기, 체인 조회, 기록) |
| `worker.html` | 휴대폰 MetaMask 앱 안에서 열리는 서명 페이지 |
| `config.js` | 컨트랙트 주소, RPC 주소, 장비 목록 |
| `vendor/` | ethers(서명 확인·체인 조회), QR 만들기, QR 읽기(jsQR) — 인터넷 없이도 불러오게 함께 둠 |

## 올리는 법 (GitHub Pages, 무료 · HTTPS)

카메라와 MetaMask 앱 연결은 **https 주소**에서만 동작해요. 그래서 GitHub Pages에 올려요.

1. GitHub에서 **New repository** → 이름 `badge-terminal`, **Public** → Create
2. **uploading an existing file** → 이 `terminal` 폴더 **안의 것 전부**(`index.html`, `worker.html`, `config.js`, `vendor` 폴더)를 끌어다 놓기 → Commit
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save
4. 1~2분 뒤 `https://<GitHub 아이디>.github.io/badge-terminal/` 이 장비 화면이에요

> 올라가는 건 컨트랙트 주소 같은 공개 정보뿐이에요. `.env`(개인 키)는 이 폴더에 없어요.

## 시연 순서

1. **PC**: 위 주소를 열고 장비를 고른 뒤 **카메라 켜기** → 허용
2. **아이폰**: App Store에서 **MetaMask** 설치 → 작업자 계정(계정 2) 불러오기
   - 수업용 테스트 지갑이면 "기존 지갑 가져오기"에 복구 구문(단어 12개)을 넣으면 계정 1·2가 함께 생겨요
   - 진짜 자산이 있는 지갑의 복구 구문은 절대 이렇게 쓰지 마세요
3. 아이폰 **기본 카메라**로 장비 QR을 찍기 → MetaMask 앱이 열림 → **MetaMask로 서명하기** → 확인
4. 휴대폰에 나온 **응답 QR**을 PC 카메라에 보여 주기 → 시동 허용 / 거부

정지 시연: `npx hardhat badge:revoke --id 3 --network sepolia` 후 다시 찍으면 **거부**로 바뀌어요 (블록에 들어가는 10~30초 뒤).

## 막히면

| 증상 | 해결 |
|---|---|
| 오른쪽 위가 "블록체인 연결 실패" | `config.js` 의 `rpcs` 맨 앞에 Alchemy·Infura Sepolia 주소를 넣고 다시 올리기 |
| 카메라가 안 켜짐 | 주소가 https 인지 확인, 브라우저 주소창의 카메라 권한 허용. 안 되면 휴대폰의 "응답 코드 복사" → 장비 화면 "응답 코드 붙여넣기" |
| QR 찍어도 MetaMask 가 안 열림 | 장비 화면에서 "일반 링크" 로 바꾼 뒤, 열린 페이지의 "MetaMask 앱에서 열기" 누르기 |
| "필요한 배지가 없거나…" | MetaMask 에서 고른 계정이 배지를 받은 작업자 주소(계정 2)인지 확인 |

## 한계 (논문용)

- 장비 화면의 기록은 그 화면(브라우저)에만 남아요. 관리자가 모아 보려면 기록을 체인 이벤트나 별도 저장소로 보내야 해요.
- 장비에 인터넷이 없으면 체인을 조회할 수 없어요 → 오프라인 검증(③)은 향후 과제.
