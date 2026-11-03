// 장비 단말 · 작업자 페이지 공통 설정 — 서버 없이 브라우저가 블록체인에 직접 물어본다
window.WB_CONFIG = {
  network: "Sepolia",
  chainId: 11155111,
  contract: "0x17e717EdC96ac69c7c3bF0122fCb068Af6BB5002", // npm run sepolia:deploy 로 만든 WorkerBadge
  // 공개 RPC (블록체인 접속 입구). 앞에서부터 차례로 시도한다. 느리면 Alchemy·Infura 주소를 맨 앞에 넣으세요.
  rpcs: [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://sepolia.drpc.org",
    "https://rpc.sepolia.org",
  ],
  challengeTtlSec: 60, // 장비 QR 하나의 유효 시간
  equipment: [
    { id: "FL-001", type: "FORKLIFT", name: "지게차 1호기" },
    { id: "CR-001", type: "CRANE", name: "천장 크레인 1호기" },
    { id: "HZ-001", type: "HAZMAT", name: "위험물 저장소" },
  ],
};

// 테스트용: 주소 뒤에 ?rpc=...&contract=...&chain=... 를 붙이면 그 값으로 바꿔서 쓴다
(() => {
  const q = new URLSearchParams(location.search);
  const c = window.WB_CONFIG;
  if (q.get("rpc")) c.rpcs = [q.get("rpc")];
  if (q.get("contract")) c.contract = q.get("contract");
  if (q.get("chain")) { c.chainId = Number(q.get("chain")); c.network = `체인 ${c.chainId}`; }
})();

// 컨트랙트에서 읽기만 하는 함수들 (가스 0)
window.WB_ABI = [
  "function isQualified(address worker, bytes32 equipmentType) view returns (bool)",
  "function hasValidBadge(address worker, uint8 badgeType) view returns (bool)",
  "function badgeOf(address worker, uint8 badgeType) view returns (uint256)",
  "function badges(uint256 tokenId) view returns (uint8 badgeType, uint64 expiresAt, bool revoked, bytes32 vcHash)",
  "function requirementsOf(bytes32 equipmentType) view returns (uint8[])",
];
window.WB_TYPES = ["지게차 면허", "크레인 면허", "위험물 취급", "안전교육 이수"];
// 서명 형식: EIP-712 (scripts/verifier.js 와 같음). 체인 ID·컨트랙트 주소가 서명에 묶여서 다른 체인·배포본에서 못 쓴다
window.WB_ACCESS_TYPES = { Access: [{ name: "equipmentId", type: "string" }, { name: "nonce", type: "bytes32" }, { name: "expiresAt", type: "uint64" }] };
window.WB_TYPED = (eq, nonce, expiresAt) => ({
  domain: { name: "WorkerBadge Access", version: "1", chainId: window.WB_CONFIG.chainId, verifyingContract: window.WB_CONFIG.contract },
  types: window.WB_ACCESS_TYPES, primaryType: "Access", message: { equipmentId: eq, nonce, expiresAt: Number(expiresAt) },
});

// 공개 RPC 중 응답하는 것 하나를 골라 연결
window.WB_PROVIDER = async () => {
  const c = window.WB_CONFIG;
  let lastErr;
  for (const url of c.rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(url, c.chainId, { staticNetwork: true });
      const block = await Promise.race([p.getBlockNumber(), new Promise((_, rej) => setTimeout(() => rej(new Error("시간 초과")), 8000))]);
      return { provider: p, url, block };
    } catch (e) { lastErr = e; }
  }
  throw new Error("블록체인에 연결할 수 없어요 (인터넷 연결이나 config.js 의 RPC 주소를 확인하세요): " + (lastErr && lastErr.message));
};
